#!/usr/bin/env python3
"""
Phase 1 — SEO Audit: Compare old vs new site CSV data.
Outputs: seo_audit_report.csv
"""

import csv, re, urllib.parse
from pathlib import Path

OLD_CSV = "old_website_urls.csv"
NEW_CSV = "new_website_urls.csv"
OUT_CSV = "seo_audit_report.csv"

NEW_DOMAIN       = "witty-field-015b59200.6.azurestaticapps.net"
NEW_SITE_BASE    = "https://junkyardsnearme.com"   # new site canonical
OLD_SITE_BASE    = "https://www.junkyardsnearme.com"


# ── URL normalisation helpers ─────────────────────────────────────────────────

def path_of(url: str) -> str:
    """Return normalised path (no trailing slash, no query/fragment)."""
    p = urllib.parse.urlparse(url)
    path = p.path.rstrip("/") or "/"
    return path


def slug_to_id(path: str) -> str | None:
    """Extract numeric ID from a vendor/junkyard slug like /junkyards/texas/1234567-name."""
    m = re.match(r".*/(\d{6,})-", path)
    return m.group(1) if m else None


def map_old_to_new(old_path: str) -> str | None:
    """
    Best-effort mapping of old URL path → new URL path.
    Returns new path string or None if no mapping known.
    """
    # Exact / near-exact static pages
    STATIC_MAP = {
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
    }
    if old_path in STATIC_MAP:
        return STATIC_MAP[old_path]

    # /junkyards/{state}/{id-slug}  →  /vendors/{id}
    m = re.match(r"^/junkyards/[^/]+/(\d{6,})-", old_path)
    if m:
        return f"/vendors/{m.group(1)}"

    # /rate-junkyard/{id-slug}  →  /vendors/{id}
    m = re.match(r"^/rate-junkyard/(\d{6,})-", old_path)
    if m:
        return f"/vendors/{m.group(1)}"

    # /junkyards/{state}  →  /browse/{state}
    m = re.match(r"^/junkyards/([^/]+)$", old_path)
    if m:
        return f"/browse/{m.group(1)}"

    # /browse/{state}
    m = re.match(r"^/browse(/[^/]*)?$", old_path)
    if m:
        return old_path   # same on new site

    return None


def issues(row: dict, side: str) -> list:
    problems = []
    if not row.get("Page Title", "").strip():
        problems.append(f"No title ({side})")
    elif len(row["Page Title"]) > 70:
        problems.append(f"Title too long ({len(row['Page Title'])} chars, {side})")
    if not row.get("Meta Description", "").strip():
        problems.append(f"No meta description ({side})")
    elif len(row["Meta Description"]) > 160:
        problems.append(f"Description too long ({len(row['Meta Description'])} chars, {side})")
    if not row.get("H1", "").strip():
        problems.append(f"No H1 ({side})")
    return problems


# ── Load CSVs ─────────────────────────────────────────────────────────────────

def load_csv(path: str) -> dict:
    """Return dict keyed by normalised path."""
    rows = {}
    with open(path, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            p = path_of(row["URL"])
            rows[p] = row
    return rows


print("Loading CSVs...")
old_rows = load_csv(OLD_CSV)
new_rows = load_csv(NEW_CSV)
print(f"  Old site: {len(old_rows)} unique paths")
print(f"  New site: {len(new_rows)} unique paths")

# ── Build audit ───────────────────────────────────────────────────────────────

records = []

for old_path, old_row in old_rows.items():
    new_path = map_old_to_new(old_path)
    new_row  = new_rows.get(new_path, {}) if new_path else {}

    if new_row:
        status = "matched"
    elif new_path:
        status = "missing_on_new"
    else:
        status = "no_mapping"

    all_issues = issues(old_row, "old") + (issues(new_row, "new") if new_row else
                 ([f"Page missing on new site"] if new_path else ["No URL mapping"]))

    records.append({
        "Old URL":         old_row["URL"],
        "New URL":         (NEW_SITE_BASE + new_path) if new_path else "",
        "Status":          status,
        "Old Title":       old_row.get("Page Title", ""),
        "New Title":       new_row.get("Page Title", ""),
        "Old Description": old_row.get("Meta Description", ""),
        "New Description": new_row.get("Meta Description", ""),
        "Old H1":          old_row.get("H1", ""),
        "New H1":          new_row.get("H1", ""),
        "Issues":          " | ".join(all_issues) if all_issues else "OK",
    })

# Also flag new-site pages that have no old counterpart (new pages)
old_mapped_new_paths = set()
for op in old_rows:
    np = map_old_to_new(op)
    if np:
        old_mapped_new_paths.add(np)

for new_path, new_row in new_rows.items():
    if new_path not in old_mapped_new_paths:
        all_issues = issues(new_row, "new")
        records.append({
            "Old URL":         "",
            "New URL":         new_row["URL"],
            "Status":          "new_page_no_old",
            "Old Title":       "",
            "New Title":       new_row.get("Page Title", ""),
            "Old Description": "",
            "New Description": new_row.get("Meta Description", ""),
            "Old H1":          "",
            "New H1":          new_row.get("H1", ""),
            "Issues":          " | ".join(all_issues) if all_issues else "OK",
        })

# ── Write output ──────────────────────────────────────────────────────────────

cols = ["Old URL","New URL","Status","Old Title","New Title",
        "Old Description","New Description","Old H1","New H1","Issues"]

with open(OUT_CSV, "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=cols)
    w.writeheader()
    w.writerows(records)

# Summary
from collections import Counter
statuses = Counter(r["Status"] for r in records)
issues_count = sum(1 for r in records if r["Issues"] != "OK")

print(f"\n✅ Audit complete → {OUT_CSV}")
print(f"   Total records : {len(records)}")
for s, c in statuses.most_common():
    print(f"   {s:25s}: {c}")
print(f"   Pages with issues: {issues_count}")
