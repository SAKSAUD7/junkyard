# JYNM Legacy-URL / Google Search Console Handover Checklist

Scope: migration from the old QAP-era JYNM URLs to the current React + Django
stack. Produced by `scripts/build_legacy_redirects.py` +
`scripts/generate_nginx_redirects.py`.

**Verification status: local only.** Every number below comes from a command that
was actually run on this machine against a sandbox nginx and the live HTTP API.
Nothing here has been applied to production.

## 0. Two production blockers to clear before anything else

1. **`junkyardsnearme.com` does not point at this stack yet.** The domain still
   resolves to the old Apache/PHP/Twig site (148.72.64.122), while the React +
   Django build answers on `2.25.151.68`. Until the cutover, none of the redirect
   work in this repo has any effect on crawlers. The cutover is a DNS/production
   change and was deliberately not performed.
2. **The old site is currently erroring on vendor pages.** Requests to
   `https://junkyardsnearme.com/junkyards/<state>/<slug>` return a Twig fatal
   stack trace with **HTTP 200** (and disclose absolute server paths). That is a
   live soft-200 error page on the exact URLs that hold the link equity, and it is
   leaking internals. Fix or suppress it on the old box before the cutover; after
   the cutover it stops being reachable at all.

## 1. Property and ownership
- [ ] Confirm the verified GSC property is `https://junkyardsnearme.com/` (Domain
      property preferred so `www` and non-www are both covered).
- [ ] Confirm DNS TXT / verification file ownership; check the old QAP-era
      property is not the one being monitored.
- [ ] `frontend/index.html` carries a commented `google-site-verification`
      placeholder — the real tag must be pasted there (or verified via DNS) before
      GSC will report on the new build.
- [ ] The static `<link rel="canonical" href="https://junkyardsnearme.com/">` was
      removed from `frontend/index.html` (it shipped a homepage-pointing canonical
      on every deep page). Per-route canonicals come from
      `frontend/src/components/SEO.jsx`.

## 2. Deploy and verify redirects on the real domain

The 45,886 validated rules live in `nginx/jynm_legacy_redirects.map` and are
`include`d once at http{} context by both committed configs; the SPA fallback
`location /` consults `$jynm_legacy_redirect` and issues the 301 server-side, so
redirects do not depend on React. Enable **one** config only — both include the
same map and a duplicate `map $uri $jynm_legacy_redirect` fails `nginx -t`.
Recommended: `nginx/junkyardsnearme.conf` (it 301s `www` → apex, which matches the
sitemap's non-www host).

Apply on the VPS (Hostinger VPS hPanel → Browser Terminal, or `ssh root@<vps-ip>`;
`deploy-jynm` is the self-installed wrapper around `deploy_hpanel.sh`):

```bash
cd /home/junkyard                      # /var/www/junkyard if that is the checkout
sudo -u www-data git status --short    # confirm nothing is locally modified
deploy-jynm                            # git reset --hard origin/main + build + restart
ls -l /home/junkyard/nginx/jynm_legacy_redirects.map   # must exist (git pull brings it)
sudo cp /home/junkyard/nginx/junkyardsnearme.conf /etc/nginx/sites-available/junkyardsnearme.com
sudo ln -sf /etc/nginx/sites-available/junkyardsnearme.com /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/jynm
sudo nginx -t                          # MUST pass; a missing map aborts here
sudo systemctl reload nginx
```

`nginx -t` is the gate: never `reload` past a failing test, and never enable both
committed configs at once.

- [ ] `sudo nginx -t && sudo systemctl reload nginx` (a missing map file aborts
      the test — verified — so a bad deploy cannot take the site down silently).
- [ ] Spot-check one rule per family returns **301** (not 200, not 302) in one hop:
  ```bash
  for u in /vendors /browse/alabama /about-us /privacy-policy \
           /terms-and-conditions /feedback /error \
           /junkyards/texas/9998116-bryan-auto-recycling-bryan-tx \
           /vendor/cumberland-salvage/photos /parts/sun-visor/washington; do
    curl -sI "https://junkyardsnearme.com$u" | \
      awk -v u=$u 'NR==1{printf "%-60s %s ", u, $2} /^[Ll]ocation/{print "->", $2}'
  done
  ```
- [ ] Confirm live URLs are **not** redirected:
      `curl -sI https://junkyardsnearme.com/junkyards/georgia` must be `200`.
- [ ] Confirm no chain: `curl -sIL` shows exactly one `301` then `200`.
      (Note: on `www`, expect `301 → 301 → 200` because host normalisation happens
      first; that is the pre-existing apex/www policy, not a map defect.)
- [ ] Confirm unknown paths fall through to the SPA and are not rewritten.
- [ ] Re-run the local harness after any map change (sandbox nginx on :8099):
      `python3 /path/to/verify.py` — 22/22 targeted checks + 46/46 single-hop.

## 3. Sitemap
- [ ] `/sitemap.xml` is proxied to Django (`SitemapView`), so it regenerates from
      live vendor data; `frontend/public/sitemap.xml` is a stale build-time copy
      and is not what crawlers receive.
- [ ] Submit `https://junkyardsnearme.com/sitemap.xml` in GSC → Sitemaps.
- [ ] Check the report shows ~6.1k URLs and zero errors.
- [ ] Vendor URLs in the sitemap use `/junkyards/<state>/<id>` while pages
      self-canonicalise to `/junkyards/<state>/<id>-<name>-<city>-<st>`. Decide
      in one pass which form is canonical and align both (currently they differ).
- [ ] After the map is live, the sitemap's `<loc>` values must be **destinations**,
      never legacy sources — re-check that no sitemap URL is itself a map key.

## 4. URL Inspection (sample, not exhaustive)
- [ ] Inspect a high-value state page (`/junkyards/california`), a vendor detail
      page, `/junkyards-by-location`, and one redirected alias
      (`/browse/alabama`) — confirm Google reports the destination as the indexed
      URL and "User-inspected URL" shows the 301.
- [ ] Inspect 2-3 pages that historically earned external links.

## 5. Monitoring after launch
- [ ] Pages → Indexed / Not indexed trend daily for the first 2-4 weeks.
- [ ] Crawl stats: crawl errors, "Not found (404)", and soft-404 counts.
- [ ] Link report → "Top linked pages" to see which legacy URLs still receive
      external links (export, then decide if more 301s are needed).
- [ ] Core Web Vitals and Performance reports for regression after the new build.
- [ ] Expect some URLs to keep showing as referring URLs from removed pages —
      that is normal Google lag, not a broken redirect.

## 6. Backlink CSVs: what they can and cannot do
- `reports/jynm-backlink-migration/JYNM_Final_35768_Backlinks_Audit.csv`
  (35,768 rows) records **outbound** links from JYNM pages to
  qualityautoparts.com, mostly one sitewide footer component. It is an off-site
  link profile; uploading it changes nothing in Google. 34,154 distinct JYNM
  source pages, of which only 7,698 were crawl-verified ("Semrush Crawl Match");
  the other 28,070 are "Internal Node Expansion", i.e. extrapolated.
- `validated_backlinks.csv` (9,103 rows: `Domain,StatusCode`) is the crawler view
  of third-party **referring domains**. It carries no paths, so it cannot drive
  path-level redirects; it is useful only as a outreach/monitoring list.
- **Google discovers backlinks by crawling. No CSV import registers a backlink,
  and being listed in a CSV is not evidence that Google has indexed either end
  of the link.** The only on-site lever we control is that legacy URLs answer
  with a correct 301 (or 200) instead of a soft 404, which this work fixes.

## 7. What the redirect map covers (real counts from the builder run)
```
legacy distinct URLs inspected        33,206
verified                              22,819 base rules
reports/legacy_redirects_verified.csv 45,638 rows (22,819 + 22,819 trailing-slash)
nginx/jynm_legacy_redirects.map       45,886 rules = 45,638 - 40 dropped + 288 aliases
flagged, deliberately NOT mapped      10,363
  vendor_not_found                     8,873
  vendor_ambiguous                     1,372
  unknown_state                          112
  ambiguous_id                             5
  unhandled_shape                          1
prior redirect_map.csv destinations  confirmed 0 / corrected 5,175
invariant check                        PASS (0 self-redirects, 0 chains, 0 homepage dumps)
```
- `reports/legacy_redirects_verified.csv` — the map's source of truth.
- `reports/legacy_redirects_flagged.csv` — 10,363 URLs that need a human decision.
  These are legacy vendor pages whose business is absent from, or ambiguous in, the
  recovered vendor data. Per the brief they were **not** guessed and not dumped to
  the homepage. Two acceptable options per URL: map to the closest surviving
  competitor/category page once decided, or leave it to 404 honestly.
- `redirect_map.csv` (7,698 rows) was audited and rejected as a redirect source:
  7,691 of its rows point at URLs the site already serves, and none of its
  destinations survived verification. The original CSVs are untouched.

### Conflict checks against the live stack (ran against `http://2.25.151.68`)
```
live sitemap URLs fetched                     6,638
map keys that collide with a live sitemap URL 0      <- no live page gets 301'd
distinct vendor destination pages              5,749
destinations whose vendor id is absent from the live sitemap 0
state codes used by destinations               61, all present in the sitemap   0 unknown
```
So every mapped vendor page points at a business that exists on the live site, and
no rule shadows a URL the new app already serves.

## 8. Known remaining gaps (not fixed in this pass)
- SPA fallback returns **HTTP 200 with index.html** for unknown routes, so true
  404s are soft-404s to Google. Needs a server-side 404 (or prerender) decision.
- Legacy `?attr=&p=N` pagination URLs cannot match a `$uri` map because nginx
  parses `&` as a query delimiter; they fall through to the SPA. 40 rows were
  dropped by the generator as unmatchable (source contains `=`/`&`) or off-site.
- 10,362 flagged legacy URLs awaiting a business-level decision (section 7).
- `/error → /` remains a homepage mapping (2 rules) kept from the original map.
- The `CustomRedirect` DB table + `CustomRedirectMiddleware` still exist and are
  the right place for rules added *after* launch (they fire on 404 and need no
  reload). Do **not** bulk-import the 45k map there; nginx handles it in one hash
  lookup. No migration was needed — the model already exists.
- The old `?p=N` paginated list pages (`/junkyards/indiana=&p=4` style, 2,443 rows
  in the original proposal) have no server-side rule; if those paginated URLs held
  links, the decision is a `map $args` variant, not a `$uri` rule.
