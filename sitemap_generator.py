#!/usr/bin/env python3
"""
Phase 4 — Sitemap Generator
Generates production-ready sitemap.xml for junkyardsnearme.com (new site)
Sources: static routes from App.jsx + dynamic vendors/state routes from backend API
Output: frontend/public/sitemap.xml
"""

import xml.etree.ElementTree as ET
from datetime import datetime, timezone
import requests, json, sys
from pathlib import Path

BASE_URL    = "https://witty-field-015b59200.6.azurestaticapps.net"
API_BASE    = "http://localhost:8000/api"
OUTPUT_FILE = Path("frontend/public/sitemap.xml")
TODAY       = datetime.now(timezone.utc).strftime("%Y-%m-%d")

# ── Static routes ─────────────────────────────────────────────────────────────

STATIC_PAGES = [
    # (path, priority, changefreq)
    ("/",              "1.0", "daily"),
    ("/browse",        "0.9", "weekly"),
    ("/vendors",       "0.9", "weekly"),
    ("/how-it-works",  "0.6", "monthly"),
    ("/faq",           "0.6", "monthly"),
    ("/about",         "0.5", "monthly"),
    ("/contact",       "0.5", "monthly"),
    ("/privacy",       "0.3", "monthly"),
    ("/terms",         "0.3", "monthly"),
    ("/search",        "0.7", "weekly"),
]

# Auth/private pages — excluded from sitemap
EXCLUDED = {"/signin", "/signup", "/forgot-password", "/profile",
            "/add-a-yard", "/vendor", "/admin-portal"}


# ── Helpers ───────────────────────────────────────────────────────────────────

def add_url(urlset, path, priority, changefreq, lastmod=TODAY):
    url_el = ET.SubElement(urlset, "url")
    ET.SubElement(url_el, "loc").text         = BASE_URL + path
    ET.SubElement(url_el, "lastmod").text     = lastmod
    ET.SubElement(url_el, "changefreq").text  = changefreq
    ET.SubElement(url_el, "priority").text    = priority


# ── Fetch dynamic data ────────────────────────────────────────────────────────

def fetch_vendor_ids():
    """Return list of (vendor_id,) from the API."""
    try:
        all_ids = []
        page = 1
        while True:
            r = requests.get(f"{API_BASE}/vendors/", params={"page": page, "page_size": 100},
                             timeout=15)
            if r.status_code != 200:
                break
            data = r.json()
            results = data.get("results", data) if isinstance(data, dict) else data
            if not results:
                break
            all_ids.extend(v["id"] for v in results)
            if not data.get("next"):
                break
            page += 1
        print(f"  Fetched {len(all_ids)} vendor IDs")
        return all_ids
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
        # Fallback to common US state codes
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
print("Adding browse state pages...")
state_codes = fetch_state_codes()
for code in state_codes:
    add_url(urlset, f"/browse/{code}", "0.8", "weekly")
print(f"  {len(state_codes)} state pages added")

# 3. Vendor detail pages
print("Adding vendor pages...")
vendor_ids = fetch_vendor_ids()
for vid in vendor_ids:
    add_url(urlset, f"/vendors/{vid}", "0.7", "weekly")
print(f"  {len(vendor_ids)} vendor pages added")

# ── Write output ──────────────────────────────────────────────────────────────

OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

tree = ET.ElementTree(urlset)
ET.indent(tree, space="  ")

with open(OUTPUT_FILE, "wb") as f:
    f.write(b'<?xml version="1.0" encoding="UTF-8"?>\n')
    tree.write(f, encoding="utf-8", xml_declaration=False)

total = len(STATIC_PAGES) + len(state_codes) + len(vendor_ids)
print(f"\n✅ Sitemap written → {OUTPUT_FILE}")
print(f"   Total URLs: {total}")
print(f"   Static: {len(STATIC_PAGES)} | States: {len(state_codes)} | Vendors: {len(vendor_ids)}")
