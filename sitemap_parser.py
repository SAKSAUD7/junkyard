#!/usr/bin/env python3
"""
Sitemap Parser & URL Extractor
Target: https://witty-field-015b59200.6.azurestaticapps.net/sitemap.xml
Output: new_website_urls.csv
"""

import csv
import sys
import time
import urllib.parse
import xml.etree.ElementTree as ET
from html.parser import HTMLParser

try:
    import requests
except ImportError:
    print("Installing requests...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "requests"], stdout=subprocess.DEVNULL)
    import requests

SITEMAP_HOST  = "witty-field-015b59200.6.azurestaticapps.net"
SITEMAP_URL   = f"https://{SITEMAP_HOST}/sitemap.xml"
# The sitemap <loc> entries use this domain
TARGET_DOMAIN = "junkyardsnearme.com"
ACCEPTED_DOMAINS = {SITEMAP_HOST, TARGET_DOMAIN}
OUTPUT_FILE   = "new_website_urls.csv"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; SitemapParser/1.0)"
}


# ── Minimal HTML parser ───────────────────────────────────────────────────────

class MetaParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.title       = ""
        self.description = ""
        self.h1          = ""
        self._in_title   = False
        self._in_h1      = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        t = tag.lower()
        if t == "title":
            self._in_title = True
        elif t == "h1":
            self._in_h1 = True
        elif t == "meta":
            name    = (attrs.get("name", "") or "").lower()
            prop    = (attrs.get("property", "") or "").lower()
            content = attrs.get("content", "") or ""
            if name == "description" or prop == "og:description":
                if not self.description:
                    self.description = content.strip()

    def handle_endtag(self, tag):
        if tag.lower() == "title":
            self._in_title = False
        elif tag.lower() == "h1":
            self._in_h1 = False

    def handle_data(self, data):
        if self._in_title and not self.title:
            self.title = data.strip()
        if self._in_h1 and not self.h1:
            self.h1 = data.strip()


# ── Helpers ───────────────────────────────────────────────────────────────────

def normalize(url: str) -> str:
    """Remove trailing slash and query/fragment."""
    parsed = urllib.parse.urlparse(url)
    clean = parsed._replace(query="", fragment="")
    path = clean.path.rstrip("/") or "/"
    return urllib.parse.urlunparse(clean._replace(path=path))


def fetch_sitemap(url: str) -> list[str]:
    """Fetch sitemap XML and return all <loc> URLs (handles sitemap indexes)."""
    print(f"Fetching sitemap: {url}")
    resp = requests.get(url, headers=HEADERS, timeout=30)
    resp.raise_for_status()

    root = ET.fromstring(resp.content)
    ns_map = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}

    # Sitemap index — recurse into child sitemaps
    child_maps = root.findall(".//sm:sitemap/sm:loc", ns_map)
    if child_maps:
        all_urls = []
        for loc in child_maps:
            all_urls.extend(fetch_sitemap(loc.text.strip()))
        return all_urls

    # Regular sitemap
    return [loc.text.strip() for loc in root.findall(".//sm:url/sm:loc", ns_map)]


def is_html_page(url: str) -> bool:
    """True if the URL belongs to the target domain and looks like an HTML page."""
    parsed = urllib.parse.urlparse(url)
    if parsed.netloc not in ACCEPTED_DOMAINS:
        return False
    path = parsed.path.lower()
    # Exclude obvious non-HTML extensions
    skip_exts = (".xml", ".json", ".txt", ".pdf", ".jpg", ".jpeg",
                 ".png", ".gif", ".svg", ".ico", ".css", ".js", ".woff", ".woff2")
    return not any(path.endswith(ext) for ext in skip_exts)


def verify_url(url: str) -> dict:
    """HEAD + GET a URL, extract metadata."""
    row = {
        "URL": url,
        "Status Code": "",
        "Page Title": "",
        "Meta Description": "",
        "H1": "",
    }
    try:
        resp = requests.get(url, headers=HEADERS, timeout=20, allow_redirects=True)
        row["Status Code"] = resp.status_code

        ct = resp.headers.get("Content-Type", "")
        if "html" in ct and resp.status_code == 200:
            parser = MetaParser()
            parser.feed(resp.text)
            row["Page Title"]       = parser.title
            row["Meta Description"] = parser.description
            row["H1"]               = parser.h1
    except requests.exceptions.Timeout:
        row["Status Code"] = "TIMEOUT"
    except requests.exceptions.ConnectionError:
        row["Status Code"] = "CONNECTION_ERROR"
    except Exception as e:
        row["Status Code"] = f"ERROR: {e}"
    return row


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    # 1. Fetch sitemap
    raw_urls = fetch_sitemap(SITEMAP_URL)
    print(f"  → Found {len(raw_urls)} raw URLs")

    # 2. Filter to HTML pages on target domain
    html_urls = [u for u in raw_urls if is_html_page(u)]
    print(f"  → {len(html_urls)} HTML pages on target domain")

    # 3. Normalize + deduplicate
    seen = set()
    unique_urls = []
    for u in html_urls:
        n = normalize(u)
        if n not in seen:
            seen.add(n)
            unique_urls.append(n)
    print(f"  → {len(unique_urls)} unique URLs after normalization")

    # 4. Verify each URL
    print(f"\nVerifying {len(unique_urls)} URLs...")
    results = []
    for i, url in enumerate(unique_urls, 1):
        print(f"  [{i:>3}/{len(unique_urls)}] {url}", end=" ", flush=True)
        row = verify_url(url)
        print(f"→ {row['Status Code']}")
        results.append(row)
        time.sleep(0.2)   # polite crawl delay

    # 5. Export CSV
    columns = ["URL", "Status Code", "Page Title", "Meta Description", "H1"]
    with open(OUTPUT_FILE, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=columns)
        writer.writeheader()
        writer.writerows(results)

    print(f"\n✅ Done! Exported {len(results)} rows → {OUTPUT_FILE}")

    # Quick summary
    ok  = sum(1 for r in results if str(r["Status Code"]) == "200")
    err = len(results) - ok
    print(f"   200 OK: {ok}  |  Other: {err}")


if __name__ == "__main__":
    main()
