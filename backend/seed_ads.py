"""
Seed Ads Script — JYNM
=============================
Generates ~90 high-quality Advertisement records from your
existing Vendor database, covering ALL ad slots and pages.

Run on server:
    cd /home/junkyard/backend
    venv/bin/python seed_ads.py
"""

import os, sys, django, random
from datetime import date, timedelta

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.ads.models import Advertisement
from apps.hollander.models import Vendor

print("\n========================================")
print("  JYNM Ad Seeder")
print("========================================\n")

# ── Skip if already seeded ───────────────────────────────────────────────────
existing = Advertisement.objects.count()
if existing >= 50:
    print(f"  [OK] {existing} ads already in database. Skipping seed.")
    print("  To re-seed, delete ads first via admin portal.")
    sys.exit(0)

# ── Config ───────────────────────────────────────────────────────────────────
SLOTS = [
    'strip_top',
    'strip_bottom',
    'strip_home_mid',
    'carousel_1',
    'carousel_2',
    'carousel_3',
    'carousel_4',
    'carousel_5',
]

PAGES = ['all', 'home', 'vendors', 'browse', 'about', 'contact', 'blog', 'faq']
TEMPLATES = ['standard', 'premium', 'minimal', 'compact']
BUTTONS = ['Visit Website', 'Get a Quote', 'View Inventory', 'Call Now', 'Find Parts', 'Shop Now']

# How many ads per slot (total ~90)
ADS_PER_SLOT = 11  # 8 slots × 11 = 88 ads

# ── Pick the best vendors (with website, trusted or featured first) ────────
vendors_qs = (
    Vendor.objects
    .filter(website__isnull=False)
    .exclude(website='')
    .exclude(website__iexact='N/A')
    .exclude(website__iexact='none')
    .order_by('-trusted_vendor', '-is_featured', '-is_top_rated', 'id')
)

total_vendors = vendors_qs.count()
print(f"  Found {total_vendors} vendors with websites.\n")

if total_vendors < 10:
    print("  [x] Not enough vendor data. Please import vendors first.")
    sys.exit(1)

# Take a broad pool for variety
vendor_pool = list(vendors_qs[:500])
random.shuffle(vendor_pool)

# ── Build ads ─────────────────────────────────────────────────────────────
created = 0
start_today = date.today()

for slot_idx, slot in enumerate(SLOTS):
    # Rotate through pages for variety
    page_cycle = PAGES[slot_idx % len(PAGES)]

    # Take next chunk of vendors for this slot
    slot_vendors = vendor_pool[slot_idx * ADS_PER_SLOT : (slot_idx + 1) * ADS_PER_SLOT]

    for i, vendor in enumerate(slot_vendors):
        name = vendor.name or f"Vendor #{vendor.id}"
        city = vendor.city or ''
        state = vendor.state or ''
        website = vendor.website.strip()
        if not website.startswith('http'):
            website = 'https://' + website

        title = f"{name}"
        if city and state:
            title += f" — {city}, {state}"

        # Cycle through pages & templates for diversity
        page = PAGES[(slot_idx + i) % len(PAGES)]
        template = TEMPLATES[i % len(TEMPLATES)]
        button = BUTTONS[i % len(BUTTONS)]
        priority = 10 - i  # First ads in each slot have higher priority

        Advertisement.objects.create(
            title=title,
            slot=slot,
            page=page,
            redirect_url=website,
            is_active=True,
            template_type=template,
            button_text=button,
            show_badge=(i < 3),   # First 3 per slot show "Featured" badge
            start_date=start_today,
            end_date=None,        # No expiry
            priority=priority,
        )
        created += 1

print(f"\n========================================")
print(f"  Ad Seeding Complete!")
print(f"========================================")
print(f"  - Created: {created} new ads")
print(f"  - Slots covered: {len(SLOTS)}")
print(f"  - Pages targeted: {len(PAGES)}")
print(f"\n  View them at: /admin-portal/ads")
