"""
Analyze Data Coverage Gaps
===========================
Why are many vehicles returning "Not Found"?
"""
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from apps.hollander.models import PartPricing, HollanderIndex, Make, Model

print("\n" + "="*70)
print("DATA COVERAGE ANALYSIS")
print("="*70)

# 1. Check PartPricing coverage
print("\n1. PARTPRICING COVERAGE:")
total_pricing = PartPricing.objects.count()
print(f"   Total records: {total_pricing:,}")

# Unique combinations
unique_makes = PartPricing.objects.values('make').distinct().count()
unique_models = PartPricing.objects.values('model').distinct().count()
unique_parts = PartPricing.objects.values('part_name').distinct().count()

print(f"   Unique Makes: {unique_makes}")
print(f"   Unique Models: {unique_models}")
print(f"   Unique Parts: {unique_parts}")

# Sample coverage
print("\n   Sample Makes in PartPricing:")
makes_sample = PartPricing.objects.values_list('make', flat=True).distinct()[:10]
for m in makes_sample:
    count = PartPricing.objects.filter(make=m).count()
    print(f"   - {m}: {count:,} records")

# 2. Check HollanderIndex coverage
print("\n2. HOLLANDERINDEX COVERAGE:")
total_index = HollanderIndex.objects.count()
print(f"   Total records: {total_index:,}")

# 3. The Gap
print("\n3. THE PROBLEM:")
print(f"""
   PartPricing has {total_pricing:,} records with REAL Hollander numbers.
   But there are {Make.objects.count()} makes × {Model.objects.count()} models × ~50 years × ~300 parts
   = Millions of possible combinations!
   
   PartPricing only covers a FRACTION of all possible vehicles.
   
   HollanderIndex has {total_index:,} records but NO Hollander numbers in the format "100-01460A".
   It only has idx_id codes for compatibility lookup.
""")

# 4. Test specific cases
print("\n4. TESTING SPECIFIC CASES:")

test_cases = [
    ("AMC", "Alliance", 1985),
    ("Ford", "TAURUS", 2019),
    ("Audi", "A8", 2021),
]

for make, model, year in test_cases:
    pricing_count = PartPricing.objects.filter(
        make__iexact=make,
        model__icontains=model,
        year_start__lte=year,
        year_end__gte=year
    ).count()
    
    print(f"\n   {make} {model} {year}:")
    print(f"   - PartPricing records: {pricing_count}")
    if pricing_count > 0:
        sample = PartPricing.objects.filter(
            make__iexact=make,
            model__icontains=model,
            year_start__lte=year,
            year_end__gte=year
        ).first()
        print(f"   - Sample Hollander #: {sample.hollander_number}")
    else:
        print(f"   - ❌ NO DATA in PartPricing")

print("\n" + "="*70)
print("CONCLUSION:")
print("="*70)
print("""
The "Not Found" issue is a DATA COVERAGE problem, not a connection problem.

PartPricing only has data for vehicles that were actually in inventory.
Many vehicles (especially older or rare models) simply don't have data.

SOLUTION OPTIONS:
1. Accept that some vehicles won't have Hollander numbers (data limitation)
2. Import additional data sources if available
3. Show "Call for Availability" message for vehicles without data
""")
