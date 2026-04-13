#!/usr/bin/env python3
"""
Phase 3 — Redirect Mapping
Maps old site URLs (www.junkyardsnearme.com) → new site URLs (junkyardsnearme.com)
Outputs: redirect_map.csv + staticwebapp.config.json redirect rules
"""

import csv, json, re

OLD_CSV   = "old_website_urls.csv"
OUT_CSV   = "redirect_map.csv"
CONFIG_FILE = "frontend/public/staticwebapp.config.json"

NEW_BASE = "https://junkyardsnearme.com"

# Static one-to-one mappings
STATIC_REDIRECTS = {
    "/":                       "/",
    "/junkyards":              "/vendors",
    "/junkyards-by-location":  "/browse",
    "/about-us":               "/about",
    "/about":                  "/about",
    "/contact":                "/contact",
    "/contact-us":             "/contact",
    "/privacy":                "/privacy",
    "/privacy-policy":         "/privacy",
    "/terms":                  "/terms",
    "/terms-and-conditions":   "/terms",
    "/how-it-works":           "/how-it-works",
    "/faq":                    "/faq",
    "/search":                 "/search",
    "/add-a-yard":             "/add-a-yard",
    "/signin":                 "/signin",
    "/signup":                 "/signup",
    "/forgot-password":        "/forgot-password",
}


def map_old_path(path: str):
    """Return (new_path, status) or (None, None) if no mapping."""
    if path in STATIC_REDIRECTS:
        return STATIC_REDIRECTS[path], 301

    # /junkyards/{state}/{id-slug} → /vendors/{id}
    m = re.match(r"^/junkyards/[^/]+/(\d{6,})-", path)
    if m:
        return f"/vendors/{m.group(1)}", 301

    # /rate-junkyard/{id-slug} → /vendors/{id}
    m = re.match(r"^/rate-junkyard/(\d{6,})-", path)
    if m:
        return f"/vendors/{m.group(1)}", 301

    # /junkyards/{state} → /browse/{state}
    m = re.match(r"^/junkyards/([^/]+)$", path)
    if m:
        return f"/browse/{m.group(1)}", 301

    # /browse/* pass-through
    if path.startswith("/browse"):
        return path, 200

    return None, None


import urllib.parse

def path_of(url):
    p = urllib.parse.urlparse(url)
    return (p.path.rstrip("/") or "/")

print("Loading old CSV...")
with open(OLD_CSV, newline="", encoding="utf-8") as f:
    old_rows = list(csv.DictReader(f))
print(f"  {len(old_rows)} old URLs")

records = []
azure_routes = []

for row in old_rows:
    old_url  = row["URL"]
    old_path = path_of(old_url)
    new_path, status = map_old_path(old_path)

    if new_path and new_path != old_path:
        new_url = NEW_BASE + new_path
        records.append({
            "Old URL":    old_url,
            "New URL":    new_url,
            "HTTP Status": status,
            "Rule Type":  "static" if old_path in STATIC_REDIRECTS else "pattern"
        })
        # Build Azure Static Web Apps route rule
        azure_routes.append({
            "route": old_path,
            "redirect": new_path,
            "statusCode": status
        })

# Also add www → non-www catch-all
azure_routes.insert(0, {
    "route": "https://www.junkyardsnearme.com/*",
    "redirect": "https://junkyardsnearme.com/:splat",
    "statusCode": 301
})

# Write CSV
cols = ["Old URL", "New URL", "HTTP Status", "Rule Type"]
with open(OUT_CSV, "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=cols)
    w.writeheader()
    w.writerows(records)

# Write / merge staticwebapp.config.json
try:
    with open(CONFIG_FILE) as f:
        config = json.load(f)
except (FileNotFoundError, json.JSONDecodeError):
    config = {}

config["routes"] = azure_routes + config.get("routes", [])

with open(CONFIG_FILE, "w") as f:
    json.dump(config, f, indent=2)

static_count  = sum(1 for r in records if r["Rule Type"] == "static")
pattern_count = sum(1 for r in records if r["Rule Type"] == "pattern")

print(f"\n✅ Done!")
print(f"   redirect_map.csv : {len(records)} redirects")
print(f"     Static rules   : {static_count}")
print(f"     Pattern rules  : {pattern_count}")
print(f"   {CONFIG_FILE}: {len(azure_routes)} routes written")
