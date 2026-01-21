import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.hollander.models import Make, Model, PartType, PartPricing

# Direct database query to verify data exists
print("=== DIRECT DATABASE CHECK ===")

# Get Ford
ford = Make.objects.get(make_id=16)
print(f"Make: {ford.make_name} (ID: {ford.make_id})")

# Get Model
model = Model.objects.get(model_id=101226)
print(f"Model: {model.model_name} (ID: {model.model_id})")

# Get Part
part = PartType.objects.get(part_id=268)
print(f"Part: {part.part_name} (ID: {part.part_id})")

# Query PartPricing
print("\n=== QUERYING PARTPRICING ===")
pricing = PartPricing.objects.filter(
    make_ref__make_id=16,
    model_ref__model_id=101226,
    part_type_ref__part_id=268,
    year_start__lte=2019,
    year_end__gte=2019
)

print(f"Found {pricing.count()} records")

if pricing.exists():
    record = pricing.first()
    print(f"\nFirst Record:")
    print(f"  Hollander: {record.hollander_number}")
    print(f"  Options: {record.get_all_options()[:100]}")
else:
    print("\nNo exact match. Trying fallback...")
    # Try just make + part + year
    fallback = PartPricing.objects.filter(
        make_ref__make_id=16,
        part_type_ref__part_id=268,
        year_start__lte=2019,
        year_end__gte=2019
    )
    print(f"Fallback found {fallback.count()} records")
    if fallback.exists():
        record = fallback.first()
        print(f"  Hollander: {record.hollander_number}")
        print(f"  Model: {record.model_ref.model_name if record.model_ref else 'N/A'}")
