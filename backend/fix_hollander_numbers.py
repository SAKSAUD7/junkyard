"""
Fix Hollander Numbers - Replace Wrong IDs with Real Hollander Numbers
=====================================================================
This script:
1. Clears the wrong "hollander_number" field in HollanderInterchange (1, 10, 100, etc.)
2. Matches HollanderInterchange records with PartPricing records
3. Updates with REAL Hollander numbers (601-00181 format) from PartPricing
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.hollander.models import HollanderInterchange, PartPricing
from django.db.models import Q
from datetime import datetime

print("="*80)
print("FIXING HOLLANDER NUMBERS - REPLACING WITH REAL DATA")
print("="*80)

start_time = datetime.now()

# Step 1: Analyze current state
print("\n📊 CURRENT STATE:")
total_interchange = HollanderInterchange.objects.count()
total_pricing = PartPricing.objects.count()
print(f"  Interchange records: {total_interchange:,}")
print(f"  Pricing records (with REAL Hollander#): {total_pricing:,}")

# Sample wrong numbers
wrong_samples = HollanderInterchange.objects.all()[:10]
print(f"\n❌ WRONG Hollander numbers (examples):")
for rec in wrong_samples:
    print(f"  {rec.hollander_number} - {rec.make} {rec.model} {rec.part_type}")

# Step 2: Match and update
print("\n🔄 MATCHING AND UPDATING...")
print("Strategy: Match by Make + Model + Year + Part Type")

matched_count = 0
updated_count = 0
batch_size = 1000
batch = []

# Get all interchange records
interchange_records = HollanderInterchange.objects.all()

for i, inter_rec in enumerate(interchange_records):
    if (i + 1) % 10000 == 0:
        print(f"  Processed {i+1:,} / {total_interchange:,} records...")
    
    # Try to find matching pricing record
    # Match criteria: Make, Model, Year overlap, Part type
    pricing_match = PartPricing.objects.filter(
        make__iexact=inter_rec.make,
        model__icontains=inter_rec.model,
        year_start__lte=inter_rec.year_end,
        year_end__gte=inter_rec.year_start,
        part_name__icontains=inter_rec.part_type
    ).first()
    
    if pricing_match:
        matched_count += 1
        # Update with REAL Hollander number
        if inter_rec.hollander_number != pricing_match.hollander_number:
            inter_rec.hollander_number = pricing_match.hollander_number
            # Also update options if available
            options = pricing_match.get_all_options()
            if options:
                inter_rec.options = options
            batch.append(inter_rec)
            updated_count += 1
    
    # Bulk update every batch_size records
    if len(batch) >= batch_size:
        HollanderInterchange.objects.bulk_update(
            batch, 
            ['hollander_number', 'options'],
            batch_size=batch_size
        )
        batch = []

# Update remaining
if batch:
    HollanderInterchange.objects.bulk_update(
        batch, 
        ['hollander_number', 'options'],
        batch_size=batch_size
    )

elapsed = (datetime.now() - start_time).total_seconds()

print("\n" + "="*80)
print("✅ HOLLANDER NUMBER FIX COMPLETE")
print("="*80)
print(f"  Total records processed: {total_interchange:,}")
print(f"  Records matched to pricing: {matched_count:,}")
print(f"  Records updated with REAL Hollander#: {updated_count:,}")
print(f"  Time elapsed: {elapsed:.1f} seconds")

# Step 3: Verify results
print("\n✅ VERIFICATION - Sample of FIXED Hollander numbers:")
fixed_samples = HollanderInterchange.objects.filter(
    hollander_number__contains='-'
)[:10]

if fixed_samples.exists():
    for rec in fixed_samples:
        print(f"  ✓ {rec.hollander_number} - {rec.make} {rec.model} {rec.part_type}")
        if rec.options:
            print(f"    Options: {rec.options[:80]}")
else:
    print("  ⚠️ No records with dash-format Hollander numbers found")
    print("  This might mean the matching criteria needs adjustment")

print("\n" + "="*80)
