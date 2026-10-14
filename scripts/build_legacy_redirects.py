#!/usr/bin/env python3
"""
build_legacy_redirects.py
=========================
Builds the authoritative legacy-URL -> live-JYNM-URL redirect table.

Inputs (read-only, never modified):
  reports/jynm-backlink-migration/JYNM_Final_35768_Backlinks_Audit.csv
      35,768 rows; the unique legacy URL surface actually linked to
      (34,154 distinct junkyardsnearme.com paths).
  redirect_map.csv          prior hand-made mapping (cross-checked, not trusted)
  backend/vendors_recovered.json
      vendor dump carrying both pk (live URL id) and yard_id (legacy id)
  reports/jynm_state_code_map.json
      state name/code -> 2-letter code, from the live /api/common/states/

Why this exists: on the new stack the numeric prefix of a vendor slug is looked
up as the Django pk (VendorDetail -> api.getVendor -> /api/vendors/<id>/), but
in the legacy URLs that number is the yard_id. They are different namespaces:
  legacy  /junkyards/texas/9997674-americas-best-auto-parts-kennedale-tx
          -> pk 9997674 is "Aurora Truck Centre, Houston BC"  (WRONG vendor)
          -> yard_id 9997674 is "America's Best Auto Parts, Kennedale TX",
             whose live pk is 9997593.
A naive 301 to the same number would send every legacy vendor link to an
unrelated business, which is worse than a 404. This script rewrites the numeric
prefix through the yard_id -> pk map, or flags the row.

Outputs:
  reports/legacy_redirects_verified.csv  nginx-ready 301 rules
  reports/legacy_redirects_flagged.csv   rows needing a human decision
  reports/legacy_redirects_summary.txt   counts from this run
"""
import csv
import json
import os
import re
from collections import Counter, defaultdict

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(REPO, 'reports')
AUDIT = os.path.join(OUT, 'jynm-backlink-migration',
                     'JYNM_Final_35768_Backlinks_Audit.csv')
LEGACY_MAP = os.path.join(REPO, 'redirect_map.csv')
VENDORS = os.path.join(REPO, 'backend', 'vendors_recovered.json')
STATE_MAP = os.path.join(OUT, 'jynm_state_code_map.json')

ARTIFACT_RE = re.compile(r'=&.*$')

# Legacy URL families we know how to resolve.
SUBPAGES = ('reviews', 'inventory', 'photos', 'parts', 'details', 'profile')


def slugify(value):
    value = re.sub(r'[^a-z0-9\s-]', '', str(value).lower())
    return re.sub(r'[\s-]+', '-', value).strip('-')


def norm_path(u):
    p = u.split('?')[0] if not u.startswith('http') else u
    if p.startswith('http'):
        from urllib.parse import urlparse
        p = urlparse(p).path
    p = ARTIFACT_RE.sub('', p)
    p = p.rstrip('/') or '/'
    return p.lower()


def has_artifact(u):
    return bool(ARTIFACT_RE.search(u))


class Resolver:
    def __init__(self):
        self.states = json.load(open(STATE_MAP, encoding='utf-8'))
        dump = json.load(open(VENDORS, encoding='utf-8'))
        self.by_pk = {}
        self.by_yard_id = {}
        self.by_nameslug = defaultdict(list)
        for row in dump:
            f = row.get('fields', row)
            pk = f.get('id') or row.get('pk')
            v = {
                'pk': pk,
                'yard_id': f.get('yard_id'),
                'name': f.get('name', ''),
                'city': f.get('city', ''),
                'state': str(f.get('state', '')).upper(),
            }
            self.by_pk[pk] = v
            if v['yard_id']:
                self.by_yard_id[v['yard_id']] = v
            code = self.code_for(v['state'])
            full = self.full_name_for(code)
            for token in filter(None, (v['state'].lower(), code, full, f"{slugify(v['name'])}-{code}")):
                key = slugify(v['name'])
                self.by_nameslug[token].append(v)
                self.by_nameslug[f'{key}-{token}'].append(v)
        # flat name index for lookups without a state token
        self.by_name_only = defaultdict(list)
        for v in self.by_pk.values():
            self.by_name_only[slugify(v['name'])].append(v)

    def code_for(self, token):
        if not token:
            return None
        t = str(token).lower().strip()
        return self.states.get(t)

    def full_name_for(self, code):
        return next((n for n, c in self.states.items() if c == code and len(n) > 2), None)

    def canonical(self, v):
        """VendorDetail.jsx canonical shape: /junkyards/<code>/<pk>-<name>-<city>-<code>"""
        code = self.code_for(v['state']) or str(v['state']).lower()
        parts = [slugify(v['name'])]
        if v['city']:
            parts.append(slugify(v['city']))
        parts.append(code)
        slug = '-'.join([p for p in parts if p])
        return f'/junkyards/{code}/{v["pk"]}-{slug}' if slug else f'/junkyards/{code}/{v["pk"]}'

    def vendor_by_slug_token(self, token):
        """Resolve a legacy '/vendor/<token>' or '/junkyard/<token>' segment.

        Returns (vendor, reason). reason is 'ok', 'ambiguous' or 'not_found'.
        """
        token = token.strip('-')
        for key in (token, f'{token}'):
            cands = self.by_nameslug.get(key)
            if cands:
                uniq = {c['pk'] for c in cands}
                if len(uniq) == 1:
                    return cands[0], 'ok'
                city_tok = [c for c in cands if slugify(c['city']) and token.endswith('-' + slugify(c['city']))]
                if len({c['pk'] for c in city_tok}) == 1:
                    return city_tok[0], 'ok'
                return None, 'ambiguous'
        cands = self.by_name_only.get(token)
        if cands:
            uniq = {c['pk'] for c in cands}
            if len(uniq) == 1:
                return cands[0], 'ok'
            return None, 'ambiguous'
        return None, 'not_found'

    def numeric_prefix(self, slug):
        m = re.match(r'^(\d+)', slug)
        return int(m.group(1)) if m else None


def legacy_urls():
    """Distinct legacy JYNM paths from both source inventories."""
    paths = {}
    proposed = {}
    for row in csv.DictReader(open(AUDIT, encoding='utf-8-sig')):
        src = (row.get('Source URL') or '').strip()
        if not src or 'junkyardsnearme.com' not in src:
            continue
        paths.setdefault(norm_path(src), src)
    for row in csv.DictReader(open(LEGACY_MAP, encoding='utf-8-sig')):
        old = (row.get('Old Path') or '').strip()
        if old:
            paths.setdefault(norm_path(old), old)
            new = (row.get('New Path') or '').strip()
            if old and new:
                proposed[norm_path(old)] = norm_path(new)
    return paths, proposed


def build():
    r = Resolver()
    paths, prior = legacy_urls()
    stats = Counter()
    verified = {}
    proposed = {}
    flagged = []

    def flag(path, dest, reason, note=''):
        stats[reason] += 1
        flagged.append({'source': path, 'proposed': dest or '',
                        'reason': reason, 'note': note})

    def put(src, dst):
        if src == dst:
            stats['skip_already_canonical'] += 1
            return
        if dst in ('/', ''):
            flag(src, dst, 'reject_homepage_dump', 'destination is the homepage')
            return
        existing = verified.get(src)
        if existing and existing != dst:
            flag(src, f'{existing} | {dst}', 'conflict',
                 'two different live destinations proposed')
            return
        verified[src] = dst
        stats['verified'] += 1

    for path, original in sorted(paths.items()):
        if has_artifact(original):
            stats['artifact_normalised'] += 1
        seg = [s for s in path.split('/') if s]
        if not seg:
            stats['skip_home'] += 1
            continue
        head = seg[0]

        # /junkyards[/<state>][/<slug>]
        if head == 'junkyards':
            if len(seg) == 1:
                stats['skip_already_canonical'] += 1
                continue
            state_tok, third = seg[1], (seg[2] if len(seg) > 2 else None)
            code = r.code_for(state_tok)
            if third:
                num = r.numeric_prefix(third)
                v = r.by_yard_id.get(num) if num else None
                if v:
                    put(path, r.canonical(v))
                elif num and num in r.by_pk:
                    # number is already a live pk; canonical only if the slug
                    # text agrees with that vendor
                    v2 = r.by_pk[num]
                    if slugify(v2['name']) and third.startswith(f"{num}-{slugify(v2['name'])[:12]}"):
                        stats['skip_already_canonical'] += 1
                    else:
                        flag(path, None, 'ambiguous_id',
                             f'{num} is a live pk but the slug text disagrees')
                else:
                    flag(path, None, 'vendor_not_found',
                         'numeric id is neither a yard_id nor a pk in the vendor dump')
                continue
            if code:
                if code == state_tok:
                    stats['skip_already_canonical'] += 1
                else:
                    put(path, f'/junkyards/{code}')
            else:
                flag(path, None, 'unknown_state', 'state token not in live state list')
            continue

        # /junkyard/<token>  (legacy vendor detail, name only)
        if head == 'junkyard':
            if len(seg) != 2:
                flag(path, None, 'unhandled_shape', 'unexpected /junkyard/ depth')
                continue
            tok = seg[1]
            num = r.numeric_prefix(tok)
            v = r.by_yard_id.get(num) if num else None
            if v:
                put(path, r.canonical(v))
                continue
            v, why = r.vendor_by_slug_token(tok)
            if v:
                put(path, r.canonical(v))
            else:
                flag(path, None, f'vendor_{why}', 'cannot map name to a single vendor')
            continue

        # /vendor/<token>[/<subpage>]  (legacy vendor detail + sub-pages)
        if head == 'vendor':
            if len(seg) < 2:
                stats['skip_empty'] += 1
                continue
            tok, sub = seg[1], (seg[2] if len(seg) > 2 else None)
            if sub and sub not in SUBPAGES:
                flag(path, None, 'unhandled_subpage', f'unknown sub-page /{sub}')
                continue
            num = r.numeric_prefix(tok)
            v = r.by_yard_id.get(num) if num else None
            if not v:
                v, why = r.vendor_by_slug_token(tok)
                if not v:
                    flag(path, None, f'vendor_{why}',
                         'vendor name resolves to 0 or >1 vendors')
                    continue
            put(path, r.canonical(v))
            continue

        # /parts/<part>[/<state>]
        if head == 'parts':
            if len(seg) == 3:
                code = r.code_for(seg[2])
                if code:
                    put(path, f'/junkyards/{code}')
                else:
                    flag(path, None, 'unknown_state', 'state token not in live state list')
            elif len(seg) == 2:
                put(path, '/junkyards-by-location')
            else:
                flag(path, None, 'unhandled_shape', 'unexpected /parts/ depth')
            continue

        # everything else: only map if redirect_map already proposed a live target
        if len(seg) == 1 and seg[0] in ('vendors', 'browse', 'about-us',
                                       'terms-and-conditions', 'privacy-policy',
                                       'error', 'error-feedback', 'feedback'):
            stats['skip_alias_family'] += 1
            continue
        stats['skip_other_family'] += 1

    # cross-check against the prior hand-made redirect_map.csv proposal
    agree = sum(1 for s, d in verified.items() if prior.get(s) == d)
    disagree = sum(1 for s, d in verified.items()
                   if s in prior and prior.get(s) != d)

    os.makedirs(OUT, exist_ok=True)
    vp = os.path.join(OUT, 'legacy_redirects_verified.csv')
    with open(vp, 'w', newline='', encoding='utf-8') as f:
        w = csv.writer(f)
        w.writerow(['Source Path', 'Destination Path', 'HTTP Status'])
        for src in sorted(verified):
            d = verified[src]
            if not src.endswith('/') and d != '/':
                w.writerow([src + '/', d, '301'])
            w.writerow([src, d, '301'])
    fp = os.path.join(OUT, 'legacy_redirects_flagged.csv')
    with open(fp, 'w', newline='', encoding='utf-8') as f:
        w = csv.DictWriter(f, fieldnames=['source', 'proposed', 'reason', 'note'])
        w.writeheader()
        w.writerows(flagged)

    # invariants - fail loudly rather than ship a conflicting table
    problems = []
    for src, dst in verified.items():
        if src == dst:
            problems.append(f'self-redirect {src}')
        if dst.rstrip('/') in ('', '/'):
            problems.append(f'homepage dump {src}')
        d = dst.rstrip('/')
        if d in verified:
            problems.append(f'2-hop chain {src} -> {dst} -> {verified[d]}')
    if problems:
        for p in problems[:20]:
            print('INVARIANT FAIL:', p)
        print(f'INVARIANT FAIL: {len(problems)} problem(s)')
        raise SystemExit(1)

    order = ['legacy_urls', 'artifact_normalised', 'verified',
             'skip_already_canonical', 'skip_alias_family', 'skip_other_family',
             'skip_home', 'skip_empty', 'reject_homepage_dump']
    reasons = Counter(f['reason'] for f in flagged)
    lines = [f'legacy distinct URLs inspected: {len(paths)}']
    lines += [f'{k}: {stats[k]}' for k in order if k not in ('legacy_urls',)]
    lines.append('--- flagged reasons ---')
    lines += [f'{k}: {v}' for k, v in reasons.most_common()]
    lines.append(f'verified rules (incl. trailing-slash variants in CSV): {len(verified)}')
    lines.append(f'prior redirect_map.csv destinations confirmed: {agree}')
    lines.append(f'prior redirect_map.csv destinations corrected: {disagree}')
    lines.append(f'invariant check: PASS (0 self-redirects, 0 chains, 0 homepage dumps)')
    txt = '\n'.join(lines) + '\n'
    with open(os.path.join(OUT, 'legacy_redirects_summary.txt'), 'w', encoding='utf-8') as f:
        f.write(txt)
    print(txt)
    print(f'wrote: {vp}\n       {fp}')


if __name__ == '__main__':
    build()
