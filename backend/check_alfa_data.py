from apps.hollander.models import Make, Model, PartType, PartPricing

# Check if we have data for Alfa Romeo
make = Make.objects.filter(make_name__icontains='alfa').first()
if make:
    print(f"Found Make: {make.make_name} (ID: {make.make_id})")
    
    # Check models
    models = Model.objects.filter(make=make)
    print(f"Models for {make.make_name}: {models.count()}")
    for m in models[:5]:
        print(f"  - {m.model_name} (ID: {m.model_id})")
    
    # Check if we have pricing data
    pricing_count = PartPricing.objects.filter(make_ref=make).count()
    print(f"\nPartPricing records for {make.make_name}: {pricing_count}")
    
    # Sample pricing record
    sample = PartPricing.objects.filter(make_ref=make).first()
    if sample:
        print(f"\nSample PartPricing:")
        print(f"  Make: {sample.make_ref.make_name if sample.make_ref else 'N/A'}")
        print(f"  Model: {sample.model_ref.model_name if sample.model_ref else 'N/A'}")
        print(f"  Part: {sample.part_type_ref.part_name if sample.part_type_ref else 'N/A'}")
        print(f"  Years: {sample.year_start}-{sample.year_end}")
        print(f"  Hollander#: {sample.hollander_number}")
        print(f"  Options: {sample.options}")
else:
    print("No Alfa Romeo make found in database")
    
# Check total data
print(f"\nTotal Makes: {Make.objects.count()}")
print(f"Total Models: {Model.objects.count()}")
print(f"Total PartTypes: {PartType.objects.count()}")
print(f"Total PartPricing: {PartPricing.objects.count()}")
