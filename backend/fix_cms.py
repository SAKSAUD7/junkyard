"""
Full CMS Reset & Sync Script
==============================
This script:
1. Strips all Quill/rich-text HTML from any corrupted field values
2. Converts all 'html' content_type fields to 'textarea'
3. Removes STALE/ORPHANED keys that no longer exist in default_content.py
4. Syncs the database to match the current default_content.py exactly
   (without overwriting values that an admin has intentionally changed)

Run this on the Hostinger server after git pull.
"""

import os, sys, re
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.cms.models import SiteContent
from apps.cms.default_content import DEFAULT_CMS_CONTENT

# ──────────────────────────────────────────────────────────────────────────────
# 1. Build the canonical set of (page, section, key) tuples from defaults
# ──────────────────────────────────────────────────────────────────────────────
canonical_keys = {
    (item['page'], item['section'], item['key'])
    for item in DEFAULT_CMS_CONTENT
}

# Build a lookup dict for defaults
default_lookup = {
    (item['page'], item['section'], item['key']): item
    for item in DEFAULT_CMS_CONTENT
}

print("\n========================================")
print("  CMS Full Reset & Sync")
print("========================================\n")

# ──────────────────────────────────────────────────────────────────────────────
# 2. Remove orphaned/stale DB records not in default_content.py
# ──────────────────────────────────────────────────────────────────────────────
print("Step 1: Removing stale/orphaned CMS keys...")
all_db_records = SiteContent.objects.all()
stale_count = 0
for record in all_db_records:
    key_tuple = (record.page, record.section, record.key)
    # Skip vendor_portal ad_plans (dynamic, not in defaults)
    if record.key == 'ad_plans':
        continue
    if key_tuple not in canonical_keys:
        print(f"  Removing stale key: {record.page}/{record.section}/{record.key}")
        record.delete()
        stale_count += 1
print(f"  Removed {stale_count} stale records.\n")

# ──────────────────────────────────────────────────────────────────────────────
# 3. Strip Quill HTML from any remaining field values
# ──────────────────────────────────────────────────────────────────────────────
def strip_quill_html(value):
    if not value:
        return value
    if re.search(r'<(h1|h2|h3|p|div)[^>]*class="ql-', value):
        cleaned = re.sub(r'<(h1|h2|h3|h4|p|div)[^>]*>(.*?)</(h1|h2|h3|h4|p|div)>',
                         lambda m: m.group(2), value, flags=re.DOTALL)
        cleaned = re.sub(r'<p><br\s*/?></p>', '', cleaned)
        cleaned = re.sub(r'<br\s*/?>', ' ', cleaned)
        cleaned = re.sub(r'<p>\s*</p>', '', cleaned)
        cleaned = re.sub(r'<span style="color: rgb\([^)]+\);">(.*?)</span>', r'\1', cleaned)
        cleaned = cleaned.strip()
        return cleaned if cleaned else value
    return value

print("Step 2: Stripping Quill HTML from corrupted field values...")
quill_fixed = 0
for record in SiteContent.objects.all():
    if record.value and re.search(r'<(h1|h2|h3|p|div)[^>]*class="ql-', record.value):
        original = record.value
        record.value = strip_quill_html(record.value)
        if record.value != original:
            print(f"  Cleaned: {record.page}/{record.section}/{record.key}")
            record.save(update_fields=['value'])
            quill_fixed += 1
print(f"  Cleaned {quill_fixed} Quill-corrupted values.\n")

# ──────────────────────────────────────────────────────────────────────────────
# 4. Convert all 'html' content_type to 'textarea'
# ──────────────────────────────────────────────────────────────────────────────
print("Step 3: Converting 'html' content_type to 'textarea'...")
html_count = SiteContent.objects.filter(content_type='html').count()
SiteContent.objects.filter(content_type='html').update(content_type='textarea')
print(f"  Converted {html_count} fields.\n")

# ──────────────────────────────────────────────────────────────────────────────
# 5. CRITICAL: Reset known heading fields that have Quill-corrupted values
#    to their proper clean defaults
# ──────────────────────────────────────────────────────────────────────────────
print("Step 4: Resetting corrupted heading/subheading fields to clean defaults...")
reset_count = 0
for item in DEFAULT_CMS_CONTENT:
    key_tuple = (item['page'], item['section'], item['key'])
    try:
        record = SiteContent.objects.get(page=item['page'], section=item['section'], key=item['key'])
        # Reset if value looks like Quill HTML OR if the key is a heading/subheading that is corrupted
        needs_reset = False
        if record.value and '<p>' in record.value and 'color: rgb' in record.value:
            needs_reset = True
        if record.value and re.search(r'<(h1|h2|h3|p|div)', record.value) and \
           item['content_type'] in ('text', 'textarea') and \
           item['key'] in ('heading', 'subheading', 'title', 'heading_accent', 'badge'):
            needs_reset = True
        
        if needs_reset:
            print(f"  Resetting [{item['page']}/{item['section']}/{item['key']}]")
            print(f"    Old: {repr(record.value[:60])}")
            print(f"    New: {repr(item['value'][:60])}")
            record.value = item['value']
            record.content_type = item['content_type']
            record.save(update_fields=['value', 'content_type'])
            reset_count += 1
    except SiteContent.DoesNotExist:
        pass

print(f"  Reset {reset_count} heading fields.\n")

# ──────────────────────────────────────────────────────────────────────────────
# 6. Seed any missing default keys (new fields added in code but not in DB)
# ──────────────────────────────────────────────────────────────────────────────
print("Step 5: Seeding missing CMS keys...")
seeded = 0
for item in DEFAULT_CMS_CONTENT:
    exists = SiteContent.objects.filter(
        page=item['page'], section=item['section'], key=item['key']
    ).exists()
    if not exists:
        SiteContent.objects.create(
            page=item['page'],
            section=item['section'],
            key=item['key'],
            label=item.get('label', item['key']),
            value=item['value'],
            content_type=item['content_type'],
        )
        print(f"  Seeded: {item['page']}/{item['section']}/{item['key']}")
        seeded += 1
print(f"  Seeded {seeded} new fields.\n")

print("========================================")
print("  CMS Reset Complete!")
print("========================================")
print(f"  - Removed:  {stale_count} stale keys")
print(f"  - Cleaned:  {quill_fixed} Quill values")
print(f"  - Converted:{html_count} html->textarea")
print(f"  - Reset:    {reset_count} headings to defaults")
print(f"  - Seeded:   {seeded} new keys")
print("\nYour CMS is now fully clean and synced.")
