#!/usr/bin/env python3
"""Rank the 10,363 flagged legacy JYNM URLs by recoverable link equity.

WHY THIS EXISTS
    reports/legacy_redirects_flagged.csv lists legacy junkyardsnearme.com URLs the
    redirect builder could not resolve to one live page. Somebody has to decide
    which of them are worth manual effort, so this script scores each one.

WHAT THE DATA CAN AND CANNOT SUPPORT
    No dataset in this repository carries *inbound* per-URL authority. The only
    inbound file with a Target URL column, junkyardsnearme_backlinks.csv, has 52
    rows and every single one points at the site root. The 35,768-row audit is
    outbound (JYNM footer -> qualityautoparts.com) with one identical anchor.
    So the score below is an explicitly documented proxy, not measured PageRank:

      evidence        1.00 path appears in a Semrush crawl (Verification ==
                            'Semrush Crawl Match')  -> the page really existed
                  0.35    path only appears through 'Internal Node Expansion'
                          (the audit extrapolated it from a pattern)
      link_mass       min(outbound footer rows for the path, 6) / 6 - how many
                          times the crawler saw this page emit the sitewide link
      recoverability  word-set overlap (Jaccard) between the legacy vendor token
                          and the closest live vendor name in
                          backend/vendors_recovered.json (0 if none)
      shape           prior weight for the URL family (see SHAPE_WEIGHTS)

    score = 100 * (0.40*evidence + 0.25*recoverability + 0.20*shape + 0.15*link_mass)

OUTPUT
    reports/flagged_urls_by_value.csv  (ranked, one row per flagged URL)
    stdout summary with real counts

Usage: python3 scripts/rank_flagged_urls_by_equity.py
"""

import csv
import os
import re
import sys
from collections import defaultdict
from urllib.parse import unquote, urlsplit

from build_legacy_redirects import Resolver, slugify

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FLAGGED = os.path.join(REPO, 'reports', 'legacy_redirects_flagged.csv')
AUDIT = os.path.join(REPO, 'reports', 'jynm-backlink-migration',
                     'JYNM_Final_35768_Backlinks_Audit.csv')
VERIFIED = os.path.join(REPO, 'reports', 'legacy_redirects_verified.csv')
OUT = os.path.join(REPO, 'reports', 'flagged_urls_by_value.csv')

SHAPE_WEIGHTS = {
    'junkyard_named': 1.00,   # /junkyard/<slug> - a real yard profile page
    'vendor_named': 0.90,     # /vendor/<slug>    - same content, older route
    'numeric_id': 0.85,       # /junkyards/<id>-<slug> - id already resolves
    'parts_facet': 0.45,      # /parts/...        - thin listing/facet pages
    'other': 0.30,
}

CRAFTED = re.compile(r'^/junkyards?/(?:\d+)?-?([a-z0-9&,;=\.\- ]+)$')


def norm_path(raw):
    """Path only, unescaped, no trailing slash, lower-cased for joining."""
    path = urlsplit(unquote(raw or '')).path
    return path.rstrip('/').lower() or '/'


def classify(source):
    path = norm_path(source)
    if re.match(r'^/junkyards/\d', path):
        return 'numeric_id'
    if path.startswith('/junkyard/'):
        return 'junkyard_named'
    if path.startswith('/vendor/'):
        return 'vendor_named'
    if path.startswith('/parts'):
        return 'parts_facet'
    return 'other'


SUBPAGES = ('photos', 'reviews', 'inventory', 'services', 'details', 'contact', 'info')


def legacy_token(source):
    """The vendor-name slug a legacy URL was built from, without id or sub-page."""
    path = norm_path(source)
    m = CRAFTED.match(path)
    token = m.group(1) if m else path.rsplit('/', 1)[-1]
    token = re.sub(r'^(?:/junkyards?/|/vendor/)', '', token)
    token = re.sub(r'[?]|=&.*$', '', token)       # real query tails are not part of names
    token = token.replace('&', '-')               # '&' belongs to yard names ("A-1 Auto & Spring")
    tail = token.rsplit('-', 1)[-1]
    if tail in SUBPAGES:
        token = token[:-(len(tail) + 1)]
    token = re.sub(r'^\d+[-_]', '', token)
    return token.strip('-,_ ')


def legacy_subpage(source):
    path = norm_path(source)
    tail = path.rsplit('/', 1)[-1]
    return tail if tail in SUBPAGES else ''


def name_words(slug):
    return frozenset(w for w in (re.sub(r'[^a-z0-9]', '', p) for p in slug.split('-')) if w)


def build_word_index(name_keys):
    """word -> live vendor slugs containing it, so similarity never scans all names."""
    index = defaultdict(set)
    words = {}
    for key in name_keys:
        ws = name_words(key)
        words[key] = ws
        for w in ws:
            index[w].add(key)
    return index, words


def closest_name(token, index, words):
    """(slug, jaccard) for the live vendor name sharing the most words with `token`."""
    tok_words = name_words(token)
    if not tok_words:
        return '', 0.0
    shared = defaultdict(int)
    for word in tok_words:
        for key in index.get(word, ()):
            shared[key] += 1
    if not shared:
        return '', 0.0
    best_slug, best_score = '', 0.0
    # Deterministic tie-break: set iteration order would otherwise change the
    # chosen yard between runs whenever several names share the same word count.
    ranked = sorted(shared.items(), key=lambda kv: (-kv[1], kv[0]))
    for key, _ in ranked[:40]:
        overlap = tok_words & words[key]
        score = len(overlap) / len(tok_words | words[key])
        if score > best_score:
            best_slug, best_score = key, score
    return best_slug, best_score


def state_agreement(token, cand, resolver):
    """Does the state written into the legacy slug agree with the candidate yard?

    An exact name match alone is not proof of the same business - two yards can
    share a name in different states, and sending Texas traffic to a New Jersey
    yard is worse than a 404.
    """
    code = str(cand.get('state') or '').lower()
    resolved = {resolver.code_for(w) for w in name_words(token)} - {None}
    if not resolved:
        return 'no-state-token'
    if code and code in resolved:
        return 'match'
    return 'conflict'


def main():
    audit_rows = defaultdict(lambda: [0, False])
    for row in csv.DictReader(open(AUDIT, encoding='utf-8-sig')):
        key = norm_path(row.get('Source URL'))
        entry = audit_rows[key]
        entry[0] += 1
        if (row.get('Verification') or '').strip() == 'Semrush Crawl Match':
            entry[1] = True

    # Destinations the shipped nginx map already 301s to a live 200 page. Reusing
    # one of those is proven; inventing a new target is not.
    proven_dest = {
        r['Destination Path'].rstrip('/').lower()
        for r in csv.DictReader(open(VERIFIED, encoding='utf-8'))
    }

    resolver = Resolver()
    name_keys = list(resolver.by_name_only)
    index, words = build_word_index(name_keys)

    flagged = list(csv.DictReader(open(FLAGGED, encoding='utf-8')))
    out_rows = []
    for row in flagged:
        source = row['source']
        key = norm_path(source)
        links, verified = audit_rows.get(key, [0, False])
        token = legacy_token(source)
        if token in resolver.by_name_only:
            best_name, ratio = token, 1.0
        else:
            best_name, ratio = closest_name(token, index, words)

        cands = resolver.by_name_only.get(best_name, [])
        pk_count = len({c['pk'] for c in cands})
        agree = 'n/a'
        if pk_count == 1:
            if slugify(cands[0]['state']).lower() in name_words(token):
                ratio = min(1.0, ratio + 0.10)
            proposed = resolver.canonical(cands[0])
            agree = state_agreement(token, cands[0], resolver)
        else:
            # Several live yards share this name: the match is not a mapping yet.
            proposed = ''
        # Discount similarity that does not resolve to exactly one yard.
        recoverability = ratio if pk_count == 1 else (0.4 * ratio if pk_count > 1 else 0.0)
        if agree == 'conflict':
            recoverability *= 0.5

        evidence = 1.0 if verified else 0.35
        link_mass = min(links, 6) / 6.0
        shape = SHAPE_WEIGHTS.get(classify(source), SHAPE_WEIGHTS['other'])
        score = round(100 * (0.40 * evidence + 0.25 * recoverability
                             + 0.20 * shape + 0.15 * link_mass), 1)

        out_rows.append({
            'source_url': source,
            'shape': classify(source),
            'reason': row['reason'],
            'note': row['note'],
            'crawl_verified': 'yes' if verified else 'no',
            'outbound_footer_links': links,
            'legacy_vendor_token': token,
            'legacy_subpage': legacy_subpage(source),
            'closest_live_vendor_slug': best_name,
            'live_vendor_candidates': pk_count,
            'proposed_target_if_unique': proposed,
            'proposed_target_state_agreement': agree,
            'target_already_live': ('yes' if proposed.rstrip('/').lower() in proven_dest
                                    else 'no' if proposed else ''),
            'name_similarity': round(ratio, 3),
            'evidence': round(evidence, 2),
            'link_mass': round(link_mass, 2),
            'shape_weight': shape,
            'value_score': score,
            'value_tier': tier(score),
            'suggested_action': action(ratio, pk_count, verified, agree, source),
            'needs_client_decision': 'no' if (pk_count == 1 and ratio >= 0.90
                                              and agree != 'conflict') else 'yes',
        })

    out_rows.sort(key=lambda r: (-r['value_score'], r['source_url']))
    for i, r in enumerate(out_rows, start=1):
        r['rank'] = i

    cols = ['rank', 'source_url', 'value_score', 'value_tier', 'crawl_verified',
            'outbound_footer_links', 'reason', 'legacy_vendor_token', 'legacy_subpage',
            'closest_live_vendor_slug', 'live_vendor_candidates',
            'proposed_target_if_unique', 'proposed_target_state_agreement',
            'target_already_live', 'name_similarity', 'evidence', 'link_mass',
            'shape_weight', 'shape', 'suggested_action', 'needs_client_decision', 'note']
    with open(OUT, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=cols)
        writer.writeheader()
        writer.writerows(out_rows)

    report(out_rows, len(flagged), len(audit_rows))
    print(f'\nwrote {OUT}')


def tier(score):
    if score >= 70:
        return 'A'
    if score >= 58:
        return 'B'
    if score >= 45:
        return 'C'
    return 'D'


def action(ratio, pk_count, verified, agree, source):
    if pk_count == 1 and agree == 'conflict':
        return 'do not map - the state in the legacy slug contradicts the only live yard with this name'
    if pk_count == 1 and ratio >= 0.90:
        return 'ready to map - one live yard matches this name (see proposed_target_if_unique)'
    if pk_count == 1 and ratio >= 0.70:
        return 'review the single closest match, then map'
    if pk_count > 1:
        return f'pick 1 of {pk_count} live yards sharing this name (city token decides)'
    if source.startswith('/parts'):
        return 'redirect the family to /auto-parts or drop it'
    if not verified:
        return 'no crawl evidence - 410 Gone is acceptable unless the client objects'
    return 'confirm whether the yard is still operating before mapping anywhere'


def report(rows, flagged_total, audit_paths):
    from collections import Counter
    tiers = Counter(r['value_tier'] for r in rows)
    shapes = Counter(r['shape'] for r in rows)
    verified = sum(1 for r in rows if r['crawl_verified'] == 'yes')
    ready = sum(1 for r in rows if r['needs_client_decision'] == 'no')
    multi = sum(1 for r in rows if r['live_vendor_candidates'] > 1)
    unmatched = sum(1 for r in rows if r['live_vendor_candidates'] == 0)
    print(f'flagged URLs ranked:              {len(rows)} of {flagged_total}')
    print(f'audit paths available for join:   {audit_paths}')
    print(f'crawl-verified (Semrush match):   {verified}')
    print(f'extrapolated only:                {len(rows) - verified}')
    print(f'ready to map, one live yard:      {ready}')
    print(f'ambiguous (2+ live yards):        {multi}')
    print(f'no live yard matches the name:    {unmatched}')
    agree = Counter(r['proposed_target_state_agreement'] for r in rows)
    print('state token vs proposed yard:     '
          + ', '.join(f'{k}={v}' for k, v in agree.most_common()))
    already = sum(1 for r in rows if r['target_already_live'] == 'yes')
    fresh = sum(1 for r in rows if r['target_already_live'] == 'no')
    print(f'  of the ready rows, target already 301s to a live page: {already}')
    print(f'  of the ready rows, target not yet in the shipped map:   {fresh}')
    for t in 'ABCD':
        print(f'  tier {t}: {tiers.get(t, 0)}')
    print('shapes: ' + ', '.join(f'{k}={v}' for k, v in shapes.most_common()))
    print('\nTop 15 by proxy score:')
    for r in rows[:15]:
        print(f"  {r['rank']:>5}  {r['value_score']:>5}  {r['crawl_verified']:<3} "
              f"sim={r['name_similarity']:<5} {r['source_url'][:78]}")


if __name__ == '__main__':
    sys.exit(main())
