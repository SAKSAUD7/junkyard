import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.hollander.models import Make, Model, PartPricing, PartType

# Check database counts
print("=== DATABASE STATISTICS ===")
print(f"Total Makes: {Make.objects.count()}")
print(f"Total Models: {Model.objects.count()}")
print(f"Total PartTypes: {PartType.objects.count()}")
print(f"Total PartPricing records: {PartPricing.objects.count()}")

# Check for Alfa Romeo
print("\n=== ALFA ROMEO CHECK ===")
alfa = Make.objects.filter(make_name__icontains='alfa').first()
if alfa:
    print(f"Found: {alfa.make_name} (ID: {alfa.make_id})")
    models = Model.objects.filter(make=alfa)
    print(f"Models: {models.count()}")
    for m in models[:3]:
        print(f"  - {m.model_name}")
    
    pricing = PartPricing.objects.filter(make_ref=alfa)
    print(f"PartPricing records: {pricing.count()}")
else:
    print("Alfa Romeo not found")

# Sample PartPricing record
print("\n=== SAMPLE PARTPRICING RECORD ===")
sample = PartPricing.objects.first()
if sample:
    print(f"Make: {sample.make_ref.make_name if sample.make_ref else 'None'}")
    print(f"Model: {sample.model_ref.model_name if sample.model_ref else 'None'}")
    print(f"Part: {sample.part_type_ref.part_name if sample.part_type_ref else 'None'}")
    print(f"Years: {sample.year_start}-{sample.year_end}")
    print(f"Hollander: {sample.hollander_number}")
    print(f"Options: {sample.options}")
else:
    print("No PartPricing records found!")
