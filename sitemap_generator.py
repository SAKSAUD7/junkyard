#!/usr/bin/env python3
"""
Phase 4 — Sitemap Generator + Search Engine Pinger
Generates production-ready sitemap.xml for junkyardsnearme.com
Sources: static routes from App.jsx + dynamic vendor/state routes from backend API
Output:  frontend/public/sitemap.xml

After generating the sitemap it automatically notifies:
  • Google    — via /ping endpoint
  • Bing      — via /ping endpoint
  • IndexNow  — batch URL submission (instant indexing protocol)
"""

import xml.etree.ElementTree as ET
from datetime import datetime, timezone
import requests, json, sys, time
from pathlib import Path

# ── Config ────────────────────────────────────────────────────────────────────

BASE_URL    = "https://junkyardsnearme.com"
API_BASE    = "http://localhost:8000/api"
OUTPUT_FILE = Path("frontend/public/sitemap.xml")
TODAY       = datetime.now(timezone.utc).strftime("%Y-%m-%d")

# IndexNow key (matches the .txt file in /public)
INDEXNOW_KEY  = "30c68008751bf4ca16b46846b95a81de"
INDEXNOW_HOST = "junkyardsnearme.com"

# ── Static routes ─────────────────────────────────────────────────────────────

STATIC_PAGES = [
    # (path, priority, changefreq)
    ("/",                        "1.0", "daily"),
    ("/junkyards",               "0.9", "weekly"),
    ("/junkyards-by-location",   "0.9", "weekly"),
    ("/blog",                    "0.7", "weekly"),
    ("/about",                   "0.5", "monthly"),
    ("/contact",                 "0.5", "monthly"),
    ("/privacy",                 "0.3", "monthly"),
    ("/terms",                   "0.3", "monthly"),
]

# Auth/private pages — excluded from sitemap
EXCLUDED = {"/signin", "/signup", "/forgot-password", "/profile",
            "/add-a-yard", "/vendor", "/admin-portal"}


# ── Helpers ───────────────────────────────────────────────────────────────────

def add_url(urlset, path, priority, changefreq, lastmod=TODAY):
    url_el = ET.SubElement(urlset, "url")
    ET.SubElement(url_el, "loc").text        = BASE_URL + path
    ET.SubElement(url_el, "lastmod").text    = lastmod
    ET.SubElement(url_el, "changefreq").text = changefreq
    ET.SubElement(url_el, "priority").text   = priority


# ── Fetch dynamic data ────────────────────────────────────────────────────────

def fetch_vendor_slugs():
    """Return list of (id, slug) from the API for /junkyards/<slug> URLs."""
    try:
        all_vendors = []
        page = 1
        while True:
            r = requests.get(f"{API_BASE}/vendors/",
                             params={"page": page, "page_size": 100}, timeout=15)
            if r.status_code != 200:
                break
            data = r.json()
            results = data.get("results", data) if isinstance(data, dict) else data
            if not results:
                break
            for v in results:
                slug = v.get("slug") or str(v["id"])
                all_vendors.append(f"{v['id']}-{slug}" if v.get("slug") else str(v["id"]))
            if not data.get("next"):
                break
            page += 1
        print(f"  Fetched {len(all_vendors)} vendor slugs")
        return all_vendors
    except Exception as e:
        print(f"  ⚠ Could not fetch vendors from API: {e}")
        return []


def fetch_state_codes():
    """Return state codes from data file."""
    try:
        with open("frontend/public/data/data_states.json") as f:
            states = json.load(f)
        codes = [s["stateAbbr"].lower() for s in states if s.get("stateAbbr")]
        print(f"  Found {len(codes)} state codes")
        return codes
    except Exception as e:
        print(f"  ⚠ Could not read states file: {e}")
        return ["al","ak","az","ar","ca","co","ct","de","fl","ga","hi","id","il",
                "in","ia","ks","ky","la","me","md","ma","mi","mn","ms","mo","mt",
                "ne","nv","nh","nj","nm","ny","nc","nd","oh","ok","or","pa","ri",
                "sc","sd","tn","tx","ut","vt","va","wa","wv","wi","wy"]


# ── Build sitemap ─────────────────────────────────────────────────────────────

ET.register_namespace("", "http://www.sitemaps.org/schemas/sitemap/0.9")
urlset = ET.Element("{http://www.sitemaps.org/schemas/sitemap/0.9}urlset")

# 1. Static pages
print("Adding static pages...")
for path, priority, changefreq in STATIC_PAGES:
    add_url(urlset, path, priority, changefreq)
print(f"  {len(STATIC_PAGES)} static pages added")

# 2. State browse pages
print("Adding state browse pages...")
state_codes = fetch_state_codes()
for code in state_codes:
    add_url(urlset, f"/junkyards-by-location/{code}", "0.8", "weekly")
print(f"  {len(state_codes)} state pages added")

# 3. Vendor detail pages
print("Adding vendor pages...")
vendor_slugs = fetch_vendor_slugs()
for slug in vendor_slugs:
    add_url(urlset, f"/junkyards/{slug}", "0.7", "weekly")
print(f"  {len(vendor_slugs)} vendor pages added")


# ── Write sitemap ─────────────────────────────────────────────────────────────

OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
tree = ET.ElementTree(urlset)
ET.indent(tree, space="  ")

with open(OUTPUT_FILE, "wb") as f:
    f.write(b'<?xml version="1.0" encoding="UTF-8"?>\n')
    tree.write(f, encoding="utf-8", xml_declaration=False)

total = len(STATIC_PAGES) + len(state_codes) + len(vendor_slugs)
print(f"\n✅ Sitemap written → {OUTPUT_FILE}")
print(f"   Total URLs: {total} | Static: {len(STATIC_PAGES)} | States: {len(state_codes)} | Vendors: {len(vendor_slugs)}")

# Build flat list of all URLs for IndexNow
all_urls = (
    [BASE_URL + p for p, _, _ in STATIC_PAGES]
    + [f"{BASE_URL}/junkyards-by-location/{c}" for c in state_codes]
    + [f"{BASE_URL}/junkyards/{s}" for s in vendor_slugs]
)

SITEMAP_URL = f"{BASE_URL}/sitemap.xml"


# ── Ping Google ───────────────────────────────────────────────────────────────

print("\n📡 Pinging Google...")
try:
    r = requests.get(
        "https://www.google.com/ping",
        params={"sitemap": SITEMAP_URL},
        timeout=10
    )
    if r.status_code == 200:
        print("  ✅ Google pinged successfully")
    else:
        print(f"  ⚠ Google returned HTTP {r.status_code}")
except Exception as e:
    print(f"  ⚠ Could not ping Google: {e}")


# ── Ping Bing ─────────────────────────────────────────────────────────────────

print("📡 Pinging Bing...")
try:
    r = requests.get(
        "https://www.bing.com/ping",
        params={"sitemap": SITEMAP_URL},
        timeout=10
    )
    if r.status_code == 200:
        print("  ✅ Bing pinged successfully")
    else:
        print(f"  ⚠ Bing returned HTTP {r.status_code}")
except Exception as e:
    print(f"  ⚠ Could not ping Bing: {e}")


# ── Submit via IndexNow (Bing/Yandex instant indexing) ────────────────────────

print("⚡ Submitting to IndexNow...")

INDEXNOW_BATCH = 10000  # IndexNow supports up to 10,000 URLs per request

def submit_indexnow(url_batch):
    payload = {
        "host": INDEXNOW_HOST,
        "key": INDEXNOW_KEY,
        "keyLocation": f"https://{INDEXNOW_HOST}/{INDEXNOW_KEY}.txt",
        "urlList": url_batch
    }
    r = requests.post(
        "https://api.indexnow.org/IndexNow",
        json=payload,
        headers={"Content-Type": "application/json; charset=utf-8"},
        timeout=20
    )
    return r.status_code

try:
    # Batch into chunks of INDEXNOW_BATCH
    batches = [all_urls[i:i+INDEXNOW_BATCH] for i in range(0, len(all_urls), INDEXNOW_BATCH)]
    all_ok = True
    for idx, batch in enumerate(batches, 1):
        status = submit_indexnow(batch)
        if status in (200, 202):
            print(f"  ✅ Batch {idx}/{len(batches)} accepted ({len(batch)} URLs) — HTTP {status}")
        elif status == 422:
            print(f"  ⚠ Batch {idx}: IndexNow rejected URLs (check host/key or ensure site is live)")
            all_ok = False
        else:
            print(f"  ⚠ Batch {idx}: HTTP {status}")
            all_ok = False
        if idx < len(batches):
            time.sleep(1)  # Be polite between batches

    if all_ok:
        print(f"\n🚀 Done! {len(all_urls)} URLs submitted to IndexNow.")
except Exception as e:
    print(f"  ⚠ IndexNow submission failed: {e}")

print("\n✅ All search engine notifications complete!")
print(f"   Sitemap: {SITEMAP_URL}")
print(f"   IndexNow key: {INDEXNOW_KEY} (verify at https://{INDEXNOW_HOST}/{INDEXNOW_KEY}.txt)")
