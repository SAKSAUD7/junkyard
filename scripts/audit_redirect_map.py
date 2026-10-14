#!/usr/bin/env python3
"""
audit_redirect_map.py
=====================
Read-only audit of redirect_map.csv against the CURRENT React route topology.
Originals are never modified. Outputs:

  reports/redirect_audit_verified.csv  - safe, nginx-ready 301 rules
  reports/redirect_audit_flagged.csv   - rows requiring a human decision
  reports/redirect_audit_summary.txt   - counts from this run

Classification rules (Phase 2 of the migration workflow):
  - no_op:            source path == destination path
  - list_dump:        many sources collapsed onto one list page (anti-pattern)
  - unknown_dest:     destination does not match any live React route
  - unknown_slug:     vendor destination slug not found in recovered vendor data
  - normalisation_conflict: two different sources clean up to the same path
                            with different destinations
"""
import csv
import os
import re
from collections import defaultdict

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(REPO, 'redirect_map.csv')
OUT_DIR = os.path.join(REPO, 'reports')

ARTIFACT_RE = re.compile(r'=&.*$')

LIVE_EXACT = {
    '/', '/search', '/quote', '/quotes', '/sell-your-car', '/signin', '/signup',
    '/forgot-password', '/add-a-yard', '/add-a-yard/form', '/junkyards',
    '/junkyards-by-location', '/about', '/contact', '/privacy', '/terms',
    '/how-it-works', '/faq', '/blog', '/profile',
}
LIVE_PREFIX = ('/junkyards/', '/junkyard/', '/vendors/', '/browse/', '/blog/',
               '/vendor/', '/admin-portal/')
# Alias routes that only client-redirect (App.jsx). Server 301s to them would
# recreate stale chains; requests to them are handled by the canonical block.
CLIENT_REDIRECT_ALIASES = {'/vendors', '/browse', '/about-us',
                           '/terms-and-conditions', '/privacy-policy'}


def normalize(path):
    """Strip crawler artifacts ('=&...' tails, %2F garbage), trailing slash, case."""
    p = path.strip()
    if p.startswith('http'):
        from urllib.parse import urlparse
        p = urlparse(p).path
    p = ARTIFACT_RE.sub('', p)
    p = p.rstrip('/') or '/'
    return p.lower()


def is_live(p):
    if p in LIVE_EXACT:
        return True
    for pre in LIVE_PREFIX:
        if p.startswith(pre):
            return True
    return False


def is_live_canonical_source(p):
    """Paths the CURRENT app already serves as first-class routes.

    VendorDetail.jsx builds the on-page canonical as
    '/junkyards/<state>/<id>-<name>-<city>-<st>', which is byte-identical to
    the legacy JYNM vendor URL format, so those URLs must NOT be 301'd - a
    redirect would point away from the URL the page itself declares canonical.
    """
    seg = [s for s in p.split('/') if s]
    if seg[:1] == ['junkyards'] and len(seg) in (1, 2, 3):
        return True                      # /junkyards, /junkyards/<state>, /junkyards/<state>/<slug>
    if seg[:1] == ['junkyard'] and len(seg) == 2:
        return True                      # /junkyard/<slug>
    return False


def slugify(value):
    value = re.sub(r"[^a-z0-9\s-]", '', str(value).lower())
    return re.sub(r'[\s-]+', '-', value).strip('-')


def load_known_slugs():
    """Vendor slugs from the recovered vendor dump, legacy format:
    '{yard_id}-{slug(name)}-{slug(city)}-{state_lower}'."""
    slugs = set()
    fp = os.path.join(REPO, 'backend', 'vendors_recovered.json')
    if not os.path.exists(fp):
        return slugs
    try:
        import json
        with open(fp, encoding='utf-8') as f:
            for v in json.load(f):
                v = v.get('fields', v)
                yid = str(v.get('yard_id') or v.get('id') or '').strip()
                name = slugify(v.get('name', ''))
                city = slugify(v.get('city', ''))
                state = str(v.get('state', '')).lower().strip()
                if yid and name:
                    slugs.add(f'{yid}-{name}-{city}-{state}')
    except Exception as e:
        print(f'WARN: could not load slug file {fp}: {e}')
    return slugs


def main():
    rows = list(csv.DictReader(open(SRC, encoding='utf-8-sig')))
    known_slugs = load_known_slugs()
    stats = defaultdict(int)
    verified = {}                     # norm_src -> (norm_dst, original old path)
    flagged = []                      # (old, new, reason, suggestion)
    by_norm = defaultdict(set)        # norm_src -> set of proposed norm dsts

    def flag(old, new, reason, suggestion=''):
        stats[reason] += 1
        flagged.append({'source': old, 'destination': new,
                        'reason': reason, 'suggestion': suggestion})

    for r in rows:
        old_raw, new_raw = r['Old Path'].strip(), r['New Path'].strip()
        src, dst = normalize(old_raw), normalize(new_raw)
        stats['rows_read'] += 1
        if ARTIFACT_RE.search(old_raw):
            stats['artifact_sources_normalised'] += 1

        if src == dst:
            flag(old_raw, new_raw, 'no_op', 'already canonical, no redirect needed')
            continue
        if src in CLIENT_REDIRECT_ALIASES or (
                src.startswith('/vendors/') or src.startswith('/browse/')):
            flag(old_raw, new_raw, 'alias_source',
                 'source is a current alias route; handled by canonical alias 301 block')
            continue
        if is_live_canonical_source(src):
            flag(old_raw, new_raw, 'source_already_live',
                 'source is a live, self-canonical route - must not be redirected')
            continue
        if dst == '/vendors' or dst == '/browse' or dst in CLIENT_REDIRECT_ALIASES:
            flag(old_raw, new_raw, 'list_dump',
                 'bulk mapping to an alias/list page - pick the closest live equivalent')
            continue
        if dst.startswith('/vendors/'):
            slug = dst[len('/vendors/'):]
            dst = '/junkyard/' + slug   # bypass client alias hop, go to final route
        if src.startswith('/junkyards/') and dst.startswith('/browse/'):
            # legacy /junkyards/<state> IS the current canonical route;
            # /browse/* only client-redirects back to it -> would form a loop.
            flag(old_raw, new_raw, 'alias_equivalent',
                 f'source is already the canonical live route (reverses {dst})')
            continue
        if not is_live(dst) or dst in CLIENT_REDIRECT_ALIASES:
            flag(old_raw, new_raw, 'unknown_dest', f'destination {dst} not a live route')
            continue
        if dst.startswith('/junkyard/') and known_slugs:
            if dst[len('/junkyard/'):] not in known_slugs:
                flag(old_raw, new_raw, 'unknown_slug',
                     f'destination vendor slug not found in recovered vendor data')
                continue
        by_norm[src].add(dst)

    for src, dsts in by_norm.items():
        if len(dsts) > 1:
            flag(src, ' | '.join(sorted(dsts)), 'normalisation_conflict',
                 'multiple destinations after normalisation - needs a decision')
            continue
        dst = next(iter(dsts))
        verified[src] = dst
        stats['verified'] += 1

    os.makedirs(OUT_DIR, exist_ok=True)
    vpath = os.path.join(OUT_DIR, 'redirect_audit_verified.csv')
    with open(vpath, 'w', newline='', encoding='utf-8') as f:
        w = csv.writer(f)
        w.writerow(['Source Path', 'Destination Path', 'HTTP Status'])
        for src in sorted(verified):
            w.writerow([src, verified[src], '301'])
    fpath = os.path.join(OUT_DIR, 'redirect_audit_flagged.csv')
    with open(fpath, 'w', newline='', encoding='utf-8') as f:
        w = csv.DictWriter(f, fieldnames=['source', 'destination', 'reason', 'suggestion'])
        w.writeheader()
        w.writerows(flagged)

    order = ['rows_read', 'artifact_sources_normalised', 'verified',
             'no_op', 'alias_source', 'source_already_live', 'list_dump',
             'unknown_dest', 'unknown_slug', 'normalisation_conflict']
    lines = [f'{k}: {stats[k]}' for k in order]
    lines.append(f'verified unique sources: {len(verified)}')
    lines.append(f'known vendor slugs loaded: {len(known_slugs)}')
    spath = os.path.join(OUT_DIR, 'redirect_audit_summary.txt')
    with open(spath, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines) + '\n')
    print('\n'.join(lines))
    print(f'\nwrote: {vpath}\n       {fpath}\n       {spath}')


if __name__ == '__main__':
    main()
