"""
Test BMW 325i 1993 Carrier Assembly
====================================
"""
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from apps.hollander.models import PartPricing, Make, Model

print("\n=== TESTING BMW 325i 1993 Carrier Assembly ===\n")

# Check if data exists
print("1. Checking PartPricing for BMW 325i 1993:")
bmw_records = PartPricing.objects.filter(
    make__iexact='BMW',
    model__icontains='325',
    year_start__lte=1993,
    year_end__gte=1993
)
print(f"   Total BMW 325 records for 1993: {bmw_records.count()}")

if bmw_records.exists():
    print("\n   Available parts for BMW 325 1993:")
    parts = bmw_records.values_list('part_name', flat=True).distinct()
    for part in parts[:20]:
        print(f"   - {part}")
    
    # Check for Carrier Assembly specifically
    carrier = bmw_records.filter(part_name__icontains='Carrier')
    print(f"\n   Records with 'Carrier' in name: {carrier.count()}")
    if carrier.exists():
        for c in carrier[:3]:
            print(f"   - {c.part_name}: {c.hollander_number}")
else:
    print("   ❌ NO DATA for BMW 325 1993 in PartPricing")

# Check all BMW data
print("\n2. Checking ALL BMW data:")
all_bmw = PartPricing.objects.filter(make__iexact='BMW')
print(f"   Total BMW records: {all_bmw.count()}")

# Check year range
years = all_bmw.values_list('year_start', 'year_end')
if years:
    min_year = min([y[0] for y in years if y[0]])
    max_year = max([y[1] for y in years if y[1]])
    print(f"   Year range: {min_year} - {max_year}")

# Check models
models = all_bmw.values_list('model', flat=True).distinct()
print(f"\n   BMW Models in database:")
for model in models[:15]:
    count = all_bmw.filter(model=model).count()
    print(f"   - {model}: {count} records")

print("\n" + "="*60)
print("CONCLUSION:")
if not bmw_records.exists():
    print("BMW 325i 1993 is NOT in the PartPricing database.")
    print("This is why it returns 'Not Found' - the data doesn't exist!")
else:
    print("Data exists but may not have 'Carrier Assembly' part.")
