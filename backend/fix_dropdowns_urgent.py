"""
URGENT FIX: Migrate Models and Create Year Ranges
Using case-insensitive make name matching
"""
import os
import django
from datetime import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.common.models import Model as OldModel, Part as OldPart
from apps.hollander.models import Make as HollanderMake, Model as HollanderModel, PartType as HollanderPartType, YearRange
from django.db import transaction

print("\n" + "="*70)
print("URGENT DATA FIX FOR LEAD FORM DROPDOWNS")
print("="*70)

# Step 1: Create make lookup (case-insensitive)
print("\nBuilding Make lookup...")
make_lookup = {}
for make in HollanderMake.objects.all():
    # Store both original and lowercase for matching
    make_lookup[make.make_name.lower()] = make
    make_lookup[make.make_name] = make
print(f"Loaded {HollanderMake.objects.count()} makes from hollander_make")

# Step 2: Migrate Models
print("\n" + "="*70)
print("MIGRATING MODELS (Case-Insensitive Matching)")
print("="*70)

old_models = OldModel.objects.all()
print(f"Found {old_models.count()} models in common_model")

model_batch = []
matched = 0
skipped = 0

for idx, old in enumerate(old_models, 1):
    make_name = getattr(old, 'make_name', None)
    if not make_name:
        skipped += 1
        continue
    
    # Try case-insensitive lookup
    make_obj = make_lookup.get(make_name) or make_lookup.get(make_name.lower())
    
    if not make_obj:
        skipped += 1
        continue
    
    model_name = getattr(old, 'name', '') or getattr(old, 'model_name', '')
    if not model_name:
        skipped += 1
        continue
    
    model = HollanderModel(
        model_id=idx,
        make=make_obj,
        model_name=model_name
    )
    model_batch.append(model)
    matched += 1

print(f"  Matched: {matched} models")
print(f"  Skipped: {skipped} models")

if model_batch:
    HollanderModel.objects.bulk_create(model_batch, ignore_conflicts=True)
    print(f"✓ Migrated {len(model_batch)} models to hollander_model")

# Step 3: Create Year Ranges
print("\n" + "="*70)
print("CREATING YEAR RANGES (1990 - 2026)")
print("="*70)

current_year = 2026
models = HollanderModel.objects.select_related('make').all()
print(f"Creating year ranges for {models.count()} models")

year_batch = []
for model in models:
    yr = YearRange(
        make=model.make,
        model=model,
        year_start=1990,
        year_end=current_year
    )
    year_batch.append(yr)

if year_batch:
    YearRange.objects.bulk_create(year_batch, ignore_conflicts=True)
    print(f"✓ Created {len(year_batch)} year ranges")

# Final Summary
print("\n" + "="*70)
print("✅ MIGRATION COMPLETE!")
print("="*70)
print(f"Models migrated: {len(model_batch)}")
print(f"Parts available: {HollanderPartType.objects.count()}")
print(f"Year ranges created: {len(year_batch)}")
print(f"\n🎉 Lead form dropdowns should NOW work!")
print("   Refresh your browser and try selecting a Make!")
print("="*70)
