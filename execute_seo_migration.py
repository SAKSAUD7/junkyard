#!/usr/bin/env python3
"""
SEO Migration Executor - junkyardsnearme.com
Reads final_working_urls (4).csv
Generates:
1. redirect_map.csv (for Cloudflare/edge routing debugging)
2. frontend/public/staticwebapp.config.json (Azure routing config)
3. frontend/public/sitemap.xml (SEO Sitemap)
"""

import csv
import json
import re
import os
import urllib.parse
from datetime import datetime

INPUT_CSV = "/home/adminpc/junkyard/junkyard/final_working_urls (4).csv"
OUTPUT_CSV = "/home/adminpc/junkyard/junkyard/redirect_map.csv"
CONFIG_FILE = "/home/adminpc/junkyard/junkyard/frontend/public/staticwebapp.config.json"
SITEMAP_FILE = "/home/adminpc/junkyard/junkyard/frontend/public/sitemap.xml"

DOMAIN = "https://junkyardsnearme.com"

STATIC_MAPPINGS = {
    "/": "/",
    "/junkyards": "/vendors",
    "/junkyards-by-location": "/browse",
    "/about-us": "/about",
    "/about": "/about",
    "/contact": "/contact",
    "/contact-us": "/contact",
    "/privacy": "/privacy",
    "/privacy-policy": "/privacy",
    "/terms": "/terms",
    "/terms-and-conditions": "/terms",
    "/how-it-works": "/how-it-works",
    "/faq": "/faq",
    "/search": "/search",
    "/add-a-yard": "/add-a-yard",
    "/signin": "/signin",
    "/signup": "/signup",
    "/forgot-password": "/forgot-password",
    "/error": "/",
    "/error-feedback": "/contact",
    "/feedback": "/contact"
}

def map_url_path(path: str):
    """Maps old junkyardsnearme paths to the new architecture paths."""
    # Ensure starting slash
    if not path.startswith('/'):
        path = '/' + path
        
    path_no_slash = path.rstrip("/") or "/"
        
    # Check strict static mappings
    if path_no_slash in STATIC_MAPPINGS:
        return STATIC_MAPPINGS[path_no_slash], 301
        
    # Pattern: /junkyards/{state}/{id-slug} -> /vendors/{id-slug}
    # Wait, the URL has slug e.g. /junkyards/virginia/7364279-downtown-auto-parts-fredericksburg-va
    # We want it to redirect to /vendors/7364279-downtown-auto-parts-fredericksburg-va
    m_detail = re.match(r"^/junkyards/[^/]+/([\d]+-[^/?]+)", path)
    if m_detail:
        return f"/vendors/{m_detail.group(1)}", 301
        
    # Pattern: /junkyards/{state} -> /browse/{state}
    m_state = re.match(r"^/junkyards/([^/?]+)", path)
    if m_state:
        # Ignore pagination query string things like %2F or =&p= for state string
        # Actually some of the CSV has invalid messy urls like "/junkyards/georgia=&p=1"
        # We will extract just the state name if there is junk
        state_part = m_state.group(1)
        state_clean = state_part.split('=')[0].split('%')[0].split('?')[0]
        if state_clean:
            return f"/browse/{state_clean}", 301
        else:
            return "/browse", 301

    # Catch-all for other /junkyards requests
    if path.startswith("/junkyards"):
        return "/vendors", 301
        
    # If no mapping matched (which shouldn't happen for valid urls)
    return None, None

def main():
    print(f"Reading {INPUT_CSV}...")
    urls = []
    with open(INPUT_CSV, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        for row in reader:
            if not row: continue
            url = row[0].strip()
            if url.startswith("http"):
                urls.append(url)
                
    print(f"Found {len(urls)} URLs to process.")

    redirect_records = []
    azure_routes = []
    sitemap_urls = set()
    
    # Process all URLS
    for old_url in urls:
        # Parse URL
        parsed = urllib.parse.urlparse(old_url)
        path = parsed.path
        
        # We don't map /static asset requests for SEO, let them 404 or just ignore
        if path.startswith("/static"):
            continue
            
        new_path, status = map_url_path(path)
        
        if new_path:
            clean_old_path = path
            
            # Avoid self-redirect loops if old == new 
            if clean_old_path != new_path:
                redirect_records.append({
                    "Old URL": old_url,
                    "New URL": f"{DOMAIN}{new_path}",
                    "Old Path": clean_old_path,
                    "New Path": new_path,
                    "HTTP Status": status
                })
                
                # Azure Static Web Apps requires unique valid routes
                azure_routes.append({
                    "route": clean_old_path,
                    "redirect": new_path,
                    "statusCode": status
                })
                
            # Add to sitemap (only valid logical pages)
            sitemap_urls.add(new_path)
            
    # Deduplicate Azure routes and Sitemap paths
    unique_azure_routes = []
    seen_routes = set()
    for ar in azure_routes:
        if ar["route"] not in seen_routes:
            seen_routes.add(ar["route"])
            unique_azure_routes.append(ar)
            
    print(f"Generated {len(redirect_records)} valid redirects.")
    print(f"Generated {len(unique_azure_routes)} unique Azure redirect routes.")
    print(f"Generated {len(sitemap_urls)} unique canonical URL endpoints for Sitemap.")
    
    # 1. Write CSV
    with open(OUTPUT_CSV, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["Old URL", "New URL", "Old Path", "New Path", "HTTP Status"])
        writer.writeheader()
        writer.writerows(redirect_records)
    print(f"Saved -> {OUTPUT_CSV}")

    # 2. Update staticwebapp.config.json
    config = {}
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, "r") as f:
            try:
                config = json.load(f)
            except:
                pass
                
    # Retain non-route config properties
    config["routes"] = unique_azure_routes
    # Add navigation fallback if it doesn't exist
    if "navigationFallback" not in config:
        config["navigationFallback"] = {
            "rewrite": "/index.html",
            "exclude": ["/assets/*", "/images/*", "/heroes/*", "/3d/*", "/*.css", "/*.js", "/*.png", "/*.jpg", "/*.jpeg", "/*.gif", "/*.svg", "/*.ico", "/*.webp", "/*.xml", "/*.txt"]
        }
        
    with open(CONFIG_FILE, "w", encoding="utf-8") as f:
        json.dump(config, f, indent=2)
    print(f"Saved -> {CONFIG_FILE}")
    
    # 3. Create sitemap.xml
    today = datetime.now().strftime("%Y-%m-%d")
    with open(SITEMAP_FILE, "w", encoding="utf-8") as f:
        f.write('<?xml version="1.0" encoding="UTF-8"?>\n')
        f.write('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n')
        
        for path in sorted(sitemap_urls):
            loc = f"{DOMAIN}{path}"
            f.write("  <url>\n")
            f.write(f"    <loc>{loc}</loc>\n")
            f.write(f"    <lastmod>{today}</lastmod>\n")
            
            # Smart frequencies
            if path == "/":
                f.write("    <changefreq>daily</changefreq>\n")
                f.write("    <priority>1.0</priority>\n")
            elif path.startswith("/browse"):
                f.write("    <changefreq>daily</changefreq>\n")
                f.write("    <priority>0.9</priority>\n")
            elif path.startswith("/vendors/") and len(path) > 10:
                f.write("    <changefreq>weekly</changefreq>\n")
                f.write("    <priority>0.8</priority>\n")
            else:
                f.write("    <changefreq>monthly</changefreq>\n")
                f.write("    <priority>0.5</priority>\n")
                
            f.write("  </url>\n")
        f.write('</urlset>\n')
    print(f"Saved -> {SITEMAP_FILE}")
    
    print("\n✅ Step 1 & 2 Execution Complete!")

if __name__ == "__main__":
    main()
