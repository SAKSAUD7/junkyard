#!/usr/bin/env python
"""
seed_ads.py — Seeds 25+ demo advertisements across all carousel and strip slots.
Run from the junkyard/backend directory:
    python manage.py shell < scripts/seed_ads.py
Or run directly:
    cd backend && python scripts/seed_ads.py
"""
import os
import sys
import django
from datetime import date, timedelta

# ── Bootstrap Django ─────────────────────────────────────────────────────────
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.ads.models import Advertisement

# ── Helper ────────────────────────────────────────────────────────────────────
today = date.today()
forever = None           # no end_date = runs forever
next_year = today + timedelta(days=365)

def make(title, slot, page, template_type, button_text, priority=5,
         redirect_url="https://www.google.com", end_date=next_year):
    obj, created = Advertisement.objects.update_or_create(
        title=title,
        slot=slot,
        defaults=dict(
            page=page,
            template_type=template_type,
            button_text=button_text,
            redirect_url=redirect_url,
            is_active=True,
            priority=priority,
            start_date=today,
            end_date=end_date,
            show_badge=True,
        )
    )
    status = "CREATED" if created else "UPDATED"
    print(f"  [{status}] {title} → slot={slot}, page={page}")

print("\n==============================")
print("  Seeding Advertisement Data")
print("==============================\n")

# ── CAROUSEL 1 — "Top Deals Near You" (Home) ─────────────────────────────────
print("⟹ Carousel 1 (carousel_1) — Home / All")
make("AutoZone — Trusted Parts",         "carousel_1", "home", "standard", "Shop Now",   10, "https://www.autozone.com")
make("O'Reilly Auto Parts",              "carousel_1", "home", "standard", "Find Parts",  9, "https://www.oreillyauto.com")
make("RockAuto — Huge Catalog",          "carousel_1", "all",  "premium",  "Browse Now",  8, "https://www.rockauto.com")
make("CarParts.com — Free Shipping",     "carousel_1", "all",  "standard", "Get Parts",   7, "https://www.carparts.com")
make("eBay Motors — Great Deals",        "carousel_1", "home", "compact",  "View Deals",  6, "https://www.ebay.com/motors")
make("Advance Auto — Buy Online",        "carousel_1", "all",  "standard", "Order Now",   5, "https://www.advanceautoparts.com")

# ── CAROUSEL 2 — "Recommended Yards" ─────────────────────────────────────────
print("\n⟹ Carousel 2 (carousel_2) — Home / All")
make("LKQ Online — Pick Your Part",      "carousel_2", "home", "premium",  "Find Yards",  10, "https://www.lkqcorp.com")
make("U-Pull-It Salvage Yards",          "carousel_2", "all",  "standard", "Visit Yard",   9, "https://www.upullit.com")
make("Car-Part.com — Locate Parts",      "carousel_2", "home", "standard", "Search Now",   8, "https://www.car-part.com")
make("Row52 — Self-Service Yards",       "carousel_2", "all",  "compact",  "Find Yard",    7, "https://www.row52.com")
make("Pick-n-Pull — Nationwide Yards",   "carousel_2", "home", "standard", "Search Parts", 6, "https://www.picknpull.com")
make("B&R Auto Wrecking",                "carousel_2", "all",  "standard", "Shop Now",     5, "https://www.brautowrecking.com")

# ── CAROUSEL 3 — "Featured Sellers" ──────────────────────────────────────────
print("\n⟹ Carousel 3 (carousel_3) — Home / All")
make("Dorman Products — OEM Quality",    "carousel_3", "home", "premium",  "Buy Now",   10, "https://www.dormanproducts.com")
make("ACDelco — GM OEM Parts",           "carousel_3", "all",  "standard", "Shop GM",    9, "https://www.acdelco.com")
make("Mopar Parts — Chrysler OEM",       "carousel_3", "home", "compact",  "Find Mopar", 8, "https://www.mopar.com")
make("Bosch Auto Parts",                 "carousel_3", "all",  "standard", "Shop Bosch", 7, "https://www.boschautoparts.com")
make("Moog Chassis — Steering & Susp",  "carousel_3", "home", "standard", "Get Parts",  6, "https://www.moogparts.com")
make("Gates — Belts & Hoses",            "carousel_3", "all",  "compact",  "Shop Now",   5, "https://www.gates.com")

# ── CAROUSEL 4 — "Premium Inventory" ─────────────────────────────────────────
print("\n⟹ Carousel 4 (carousel_4) — Home / All")
make("Safelite AutoGlass — Book Now",    "carousel_4", "home", "premium",  "Schedule",  10, "https://www.safelite.com")
make("Firestone — Tires & Service",      "carousel_4", "all",  "standard", "Book Now",   9, "https://www.firestonecompleteautocare.com")
make("Jiffy Lube — Oil Change",          "carousel_4", "home", "compact",  "Find Us",    8, "https://www.jiffylube.com")
make("Midas — Auto Service",             "carousel_4", "all",  "standard", "Get Quote",  7, "https://www.midas.com")
make("Pep Boys — Tires & Service",       "carousel_4", "home", "standard", "Shop Now",   6, "https://www.pepboys.com")
make("Maaco — Body & Paint",             "carousel_4", "all",  "compact",  "Get Quote",  5, "https://www.maaco.com")

# ── CAROUSEL 5 — "Promoted Partners" ─────────────────────────────────────────
print("\n⟹ Carousel 5 (carousel_5) — Home / All")
make("NAPA Auto Parts",                  "carousel_5", "all",  "premium",  "Find Store",  10, "https://www.napaonline.com")
make("Holman Parts Distribution",        "carousel_5", "home", "standard", "Shop Fleet",   9, "https://www.holmanparts.com")
make("World Pac — Wholesale Parts",      "carousel_5", "all",  "standard", "Order Now",    8, "https://www.worldpac.com")
make("Keystone Automotive",              "carousel_5", "home", "compact",  "Distributor",  7, "https://www.keystoneautomotive.com")
make("Parts Authority — Fast Delivery",  "carousel_5", "all",  "standard", "Get Parts",    6, "https://www.partsauthority.com")
make("Uni-Select — Pro Distribution",   "carousel_5", "home", "standard", "Find Parts",   5, "https://www.uni-select.com")

# ── STRIP — Home Top (strip_top) ──────────────────────────────────────────────
print("\n⟹ Strip Top (strip_top) — Home")
make("Quality Auto Parts — 1-866-293-3731", "strip_top", "home", "premium", "Get Quote",   10, "https://www.qualityautoparts.com")
make("Find Parts Near You — Search Free",   "strip_top", "all",  "standard","Search Now",   8, "https://www.car-part.com")

# ── STRIP — Home Middle (strip_home_mid) ──────────────────────────────────────
print("\n⟹ Strip Home Mid (strip_home_mid) — Home")
make("Huge Inventory — Warrantied OEM",  "strip_home_mid", "home", "premium",  "Browse Now", 10, "https://www.rockauto.com")
make("Get Instant Auto Quote Today",     "strip_home_mid", "all",  "standard", "Get Quote",   8, "https://www.carparts.com")

# ── STRIP — Bottom (strip_bottom) ─────────────────────────────────────────────
print("\n⟹ Strip Bottom (strip_bottom) — All Pages")
make("Need Engine Parts? Search 6500+ Yards", "strip_bottom", "all",  "premium",  "Search Now", 10, "https://www.junkyard.com")
make("Transmission Problem? Get a Quote",     "strip_bottom", "home", "standard", "Get Quote",   8, "https://www.carparts.com")

total = Advertisement.objects.count()
print(f"\n✅ Done! Total ads in database: {total}")
print("   Visit /admin-portal/ads to see and manage them.\n")
