import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.hollander.models import Make, Model, PartType, PartPricing

# Check Ford data
print("=== FORD DATA CHECK ===")
ford = Make.objects.filter(make_name__iexact='Ford').first()
if ford:
    print(f"Ford ID: {ford.make_id}")
    
    # Check for F250SD model
    f250_models = Model.objects.filter(make=ford, model_name__icontains='F250').values('model_id', 'model_name')
    print(f"\nF250 Models ({len(f250_models)}):")
    for m in f250_models[:10]:
        print(f"  ID {m['model_id']}: {m['model_name']}")
    
    # Check Assembly part
    assembly = PartType.objects.filter(part_name__iexact='Assembly').first()
    if assembly:
        print(f"\nAssembly Part ID: {assembly.part_id}")
        
        # Try to find pricing for Ford + any F250 model + Assembly + 2019
        for model in f250_models[:5]:
            pricing = PartPricing.objects.filter(
                make_ref=ford,
                model_ref__model_id=model['model_id'],
                part_type_ref=assembly,
                year_start__lte=2019,
                year_end__gte=2019
            ).first()
            
            if pricing:
                print(f"\n✅ FOUND MATCH!")
                print(f"  Model: {model['model_name']} (ID: {model['model_id']})")
                print(f"  Hollander: {pricing.hollander_number}")
                print(f"  Options: {pricing.get_all_options()[:100]}...")
                break
        else:
            print("\n❌ No pricing found for F250 + Assembly + 2019")
            
            # Try broader search
            any_pricing = PartPricing.objects.filter(
                make_ref=ford,
                part_type_ref=assembly,
                year_start__lte=2019,
                year_end__gte=2019
            ).first()
            
            if any_pricing:
                print(f"\nBut found Ford + Assembly + 2019:")
                print(f"  Model: {any_pricing.model_ref.model_name if any_pricing.model_ref else 'N/A'}")
                print(f"  Hollander: {any_pricing.hollander_number}")
