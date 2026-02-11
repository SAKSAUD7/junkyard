"""
Analyze Complete Data Coverage
===============================
Check what data we have in each source and identify gaps
"""
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from apps.hollander.models import (
    Make, Model, PartType, PartPricing, HollanderIndex,
    HollanderMakeModelRef, HollanderPartRef
)

print("\n" + "="*70)
print("COMPLETE DATA COVERAGE ANALYSIS")
print("="*70)

# 1. Makes Coverage
print("\n1. MAKES COVERAGE:")
makes_in_db = Make.objects.count()
makes_in_pricing = PartPricing.objects.values('make').distinct().count()
makes_in_index = HollanderMakeModelRef.objects.count()
print(f"   Total Makes in DB: {makes_in_db}")
print(f"   Makes in PartPricing: {makes_in_pricing}")
print(f"   Makes in HollanderMakeModelRef: {makes_in_index}")

# 2. Models Coverage
print("\n2. MODELS COVERAGE:")
models_in_db = Model.objects.count()
models_in_pricing = PartPricing.objects.values('model').distinct().count()
models_in_index = HollanderMakeModelRef.objects.count()
print(f"   Total Models in DB: {models_in_db}")
print(f"   Models in PartPricing: {models_in_pricing}")
print(f"   Models in HollanderIndex: {models_in_index}")

# 3. Years Coverage
print("\n3. YEARS COVERAGE:")
pricing_years = PartPricing.objects.values_list('year_start', 'year_end')
min_year_pricing = min([y[0] for y in pricing_years if y[0]]) if pricing_years else 0
max_year_pricing = max([y[1] for y in pricing_years if y[1]]) if pricing_years else 0

index_years = HollanderIndex.objects.values_list('begin_year', 'end_year')
min_year_index = min([y[0] for y in index_years if y[0]]) if index_years else 0
max_year_index = max([y[1] for y in index_years if y[1]]) if index_years else 0

print(f"   PartPricing Years: {min_year_pricing} - {max_year_pricing}")
print(f"   HollanderIndex Years: {min_year_index} - {max_year_index}")

# 4. Parts Coverage
print("\n4. PARTS COVERAGE:")
parts_in_db = PartType.objects.count()
parts_in_pricing = PartPricing.objects.values('part_name').distinct().count()
parts_in_ref = HollanderPartRef.objects.count()
print(f"   Total Parts in DB: {parts_in_db}")
print(f"   Parts in PartPricing: {parts_in_pricing}")
print(f"   Parts in HollanderPartRef: {parts_in_ref}")

# 5. Sample Data Comparison
print("\n5. SAMPLE DATA COMPARISON:")
print("\n   PartPricing Sample:")
for p in PartPricing.objects.all()[:3]:
    print(f"   - {p.make} {p.model} ({p.year_start}-{p.year_end}) {p.part_name}")

print("\n   HollanderIndex Sample (with refs):")
for idx in HollanderIndex.objects.all()[:3]:
    model_ref = HollanderMakeModelRef.objects.filter(ref_id=idx.model_nm).first()
    part_ref = HollanderPartRef.objects.filter(part_code=idx.part_type_nbr).first()
    model_name = model_ref.h_model if model_ref else idx.model_nm
    part_name = part_ref.part_name if part_ref else idx.part_type_nbr
    print(f"   - {model_name} ({idx.begin_year}-{idx.end_year}) {part_name}")

# 6. Key Insight
print("\n" + "="*70)
print("💡 KEY INSIGHTS:")
print("="*70)
print(f"""
1. PartPricing has {PartPricing.objects.count():,} records with REAL Hollander numbers
2. HollanderIndex has {HollanderIndex.objects.count():,} records for compatibility
3. BOTH sources should be used together for complete coverage

RECOMMENDATION:
- Use PartPricing for Hollander numbers (format: "100-01460A")
- Use HollanderIndex to expand year/model/part coverage
- Merge both sources in API responses for maximum data
""")

print("\n" + "="*70)
