#!/usr/bin/env python3
"""
generate_nginx_redirects.py
============================
Turns the validated legacy-URL table into the nginx redirect map that both
committed server configs include.

Pipeline (run in this order):
    python3 scripts/build_legacy_redirects.py       # resolve legacy -> live
    python3 scripts/generate_nginx_redirects.py     # emit nginx map
    sudo nginx -t && sudo systemctl reload nginx    # only after -t passes

Writes:  nginx/jynm_legacy_redirects.map   (committed; travels with git pull)
Edits:   the include line inside nginx/junkyardsnearme.conf and
         server/jynm_production.nginx.conf

Why a file and not an inline block: the validated table is ~45k rules (~5 MB of
nginx config). Inlining that in the site config makes the file unreadable, and a
glob include (`include foo.conf*;`) is dangerous - a missing file is silently
skipped, the SPA location then references an undefined variable, and nginx
refuses to start, taking the whole site down. A non-glob include means a missing
map fails `nginx -t` before any reload, so the old config keeps serving.
"""
import csv
import json
import os
import re
import sys
from urllib.parse import urlparse

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VERIFIED_CSV = os.path.join(REPO_ROOT, 'reports', 'legacy_redirects_verified.csv')
MAP_FILE = os.path.join(REPO_ROOT, 'nginx', 'jynm_legacy_redirects.map')
STATE_CODE_MAP = os.path.join(REPO_ROOT, 'reports', 'jynm_state_code_map.json')
MAP_INSTALL_PATH = '/home/junkyard/nginx/jynm_legacy_redirects.map'
CONFIGS = [
    os.path.join(REPO_ROOT, 'nginx', 'junkyardsnearme.conf'),
    os.path.join(REPO_ROOT, 'server', 'jynm_production.nginx.conf'),
]

DOMAINS = ('junkyardsnearme.com', 'www.junkyardsnearme.com')
ARTIFACT_RE = re.compile(r'[=&]')

# Canonical 301s for obsolete route names, applied server-side so they do not
# depend on React's client-side <Navigate>.
CANONICAL_ALIASES = {
    '/vendors': '/junkyards',
    '/browse': '/junkyards-by-location',
    '/about-us': '/about',
    '/terms-and-conditions': '/terms',
    '/privacy-policy': '/privacy',
    '/error': '/',
    '/error-feedback': '/contact',
    '/feedback': '/contact',
}

# Prefix aliases. Named captures in a map value are interpolated by nginx.
# /browse/<token>: literal state-name/state-code entries are emitted from
# STATE_CODE_MAP (see load_rules) because the React route /junkyards/:state
# matches on the 2-letter code only - forwarding a full state name server-side
# would land on an empty state page. The regex below is the residual fallback
# for tokens that are not a known state, and it goes to the state directory
# rather than a dead page.
PREFIX_ALIASES = [
    (r'~^/vendors/(?<vslug>[^/=]+)$', '/junkyard/$vslug'),
    (r'~^/browse/(?<vstate>[^/=]+)$', '/junkyards-by-location'),
]


def nginx_quote(value):
    return '"' + value.replace('\\', '\\\\').replace('"', '\\"') + '"'


def load_state_aliases():
    """/browse/<name-or-code> -> /junkyards/<2-letter code>.

    The React BrowseState page matches on stateCode only, so a full state name
    has to be rewritten server-side or the visitor lands on an empty list.
    """
    if not os.path.exists(STATE_CODE_MAP):
        print(f'note: {os.path.relpath(STATE_CODE_MAP, REPO_ROOT)} missing - '
              f'/browse/<state> literals skipped', file=sys.stderr)
        return {}
    with open(STATE_CODE_MAP, encoding='utf-8') as f:
        codes = json.load(f)
    return {f'/browse/{token}': f'/junkyards/{code}'
            for token, code in sorted(codes.items())}


def load_rules():
    if not os.path.exists(VERIFIED_CSV):
        print(f'ERROR: {VERIFIED_CSV} not found. '
              f'Run scripts/build_legacy_redirects.py first.', file=sys.stderr)
        sys.exit(1)
    rules, dropped = {}, 0
    with open(VERIFIED_CSV, encoding='utf-8-sig') as f:
        for row in csv.DictReader(f):
            src = (row.get('Source Path') or '').strip()
            dst = (row.get('Destination Path') or '').strip()
            if not src or not dst or (row.get('HTTP Status') or '301').strip() != '301':
                continue
            # nginx parses $uri at '=', so a source containing '=' or a raw
            # '&' can never match; such rows would be dead weight.
            if ARTIFACT_RE.search(src):
                dropped += 1
                continue
            if dst.startswith('http') and urlparse(dst).netloc not in DOMAINS:
                dropped += 1
                continue
            rules[src] = dst
    for alias, target in CANONICAL_ALIASES.items():
        rules.setdefault(alias, target)
        rules.setdefault(alias.rstrip('/') + '/', target)
    for alias, target in load_state_aliases().items():
        rules.setdefault(alias, target)
        rules.setdefault(alias + '/', target)
    return rules, dropped


def check_rules(rules):
    """Abort rather than ship a table with self-loops, chains or homepage dumps."""
    problems = []
    for src, dst in rules.items():
        d = (urlparse(dst).path if dst.startswith('http') else dst)
        d = d.rstrip('/') or '/'
        s = src.rstrip('/') or '/'
        if d == s:
            problems.append(f'self-redirect: {src}')
        elif d in rules:
            problems.append(f'2-hop chain: {src} -> {dst} -> {rules[d]}')
        elif d == '/' and s != '/':
            problems.append(f'homepage dump: {src} -> {dst}')
    fatal = [p for p in problems if not p.startswith('homepage dump')]
    if fatal:
        for p in fatal[:15]:
            print('ERROR:', p, file=sys.stderr)
        print(f'ERROR: {len(fatal)} fatal redirect problem(s); refusing to write.',
              file=sys.stderr)
        sys.exit(1)
    return problems


def write_map(rules):
    lines = [
        '# JYNM legacy-URL 301 redirect map — GENERATED, do not edit by hand.',
        f'# {len(rules)} rules. Source of truth: reports/legacy_redirects_verified.csv',
        '# Regenerate: python3 scripts/build_legacy_redirects.py && '
        'python3 scripts/generate_nginx_redirects.py',
        '# ~45k keys: the 1024/64 defaults make nginx warn "could not build optimal',
        '# map_hash" and fall back to a slower layout. These values lint clean.',
        'map_hash_bucket_size 512;',
        'map_hash_max_size 65536;',
        'map $uri $jynm_legacy_redirect {',
        '    # "" = no redirect; the request falls through to the React SPA.',
        '    default                         "";',
    ]
    for src in sorted(rules):
        lines.append(f'    {nginx_quote(src):<70} {nginx_quote(rules[src])};')
    for pattern, target in PREFIX_ALIASES:
        lines.append(f'    {pattern:<70} {target};')
    lines.append('}')
    with open(MAP_FILE, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines) + '\n')


def wire_include(path):
    with open(path, encoding='utf-8') as f:
        text = f.read()
    directive = f'include {MAP_INSTALL_PATH};'
    inc_re = re.compile(r'^[ \t]*include[ \t]+[^\n]*jynm_legacy_redirects\.map[^\n]*\n',
                        re.M)
    if inc_re.search(text):
        new_text = inc_re.sub(directive + '\n', text, count=1)
        action = 'updated include'
    else:
        lines = text.split('\n')
        anchor = next((i for i, l in enumerate(lines) if l.startswith('server {')), None)
        if anchor is None:
            print(f'ERROR: no server block in {path}', file=sys.stderr)
            sys.exit(1)
        while anchor > 0 and lines[anchor - 1].lstrip().startswith('#'):
            anchor -= 1
        block = ['# ── Legacy 301 redirect map (http{} context, generated file) ──',
                 '# Regenerated by scripts/generate_nginx_redirects.py; must exist',
                 '# before `nginx -t` can pass.',
                 directive]
        new_text = '\n'.join(lines[:anchor] + block + [''] + lines[anchor:])
        action = 'inserted include'
    if new_text != text:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_text)
    return action


def main():
    rules, dropped = load_rules()
    problems = check_rules(rules)
    write_map(rules)
    for cfg in CONFIGS:
        print(f'  {wire_include(cfg)} -> {os.path.relpath(cfg, REPO_ROOT)}')
    size_kb = os.path.getsize(MAP_FILE) // 1024
    print(f'OK: {len(rules)} rules ({size_kb} KB) -> {os.path.relpath(MAP_FILE, REPO_ROOT)}')
    if dropped:
        print(f'note: dropped {dropped} unmatchable/off-site rows')
    if problems:
        print(f'note: {len(problems)} homepage-dump mapping(s) kept from the '
              f'original proposal - review them')
        for p in problems[:5]:
            print('  ', p)


if __name__ == '__main__':
    main()
