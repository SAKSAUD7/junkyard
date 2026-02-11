"""
Check Hollander Number Format in Database
"""
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from apps.hollander.models import PartPricing, HollanderIndex

print("\n=== Checking Hollander Number Format ===\n")

# Check PartPricing
print("Sample Hollander Numbers from PartPricing:")
pricing_samples = PartPricing.objects.exclude(hollander_number='').values_list('hollander_number', flat=True)[:20]
for i, num in enumerate(pricing_samples, 1):
    print(f"{i}. {num}")

print("\n" + "="*50 + "\n")

# Check HollanderIndex
print("Sample Hollander Numbers from HollanderIndex:")
index_samples = HollanderIndex.objects.exclude(hollander_id='').values_list('hollander_id', flat=True)[:20]
for i, num in enumerate(index_samples, 1):
    print(f"{i}. {num}")

print("\n" + "="*50 + "\n")

# Check specific example
print("Searching for '100-01460A' pattern:")
pricing_match = PartPricing.objects.filter(hollander_number__icontains='100-01460').first()
if pricing_match:
    print(f"Found in PartPricing: {pricing_match.hollander_number}")
    print(f"  Make: {pricing_match.make}")
    print(f"  Model: {pricing_match.model}")
    print(f"  Part: {pricing_match.part_name}")
    print(f"  Options: {pricing_match.get_all_options()}")
else:
    print("Not found in PartPricing")

index_match = HollanderIndex.objects.filter(hollander_id__icontains='100-01460').first()
if index_match:
    print(f"\nFound in HollanderIndex: {index_match.hollander_id}")
else:
    print("\nNot found in HollanderIndex")
