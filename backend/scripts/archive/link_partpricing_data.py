import os
import sys
import django
from django.db.models import F

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.hollander.models import PartPricing, Make, Model, PartType

def link_data():
    print("Linking PartPricing to Reference Tables...")
    
    # 1. Link Makes
    print("Linking Makes...")
    makes = Make.objects.all()
    for make in makes:
        # Match by name (case insensitive if needed, but imported names should match)
        count = PartPricing.objects.filter(make__iexact=make.make_name).update(make_ref=make)
        if count > 0:
            print(f"  Linked {count} records to Make: {make.make_name}")

    # 2. Link Models
    print("Linking Models...")
    # This is trickier because model names might be ambiguous without make context
    # But PartPricing usually has correct strings.
    # We iterate through models and match based on Make AND Model strings
    
    # Optimize: Process by Make
    for make_obj in makes:
         models = Model.objects.filter(make=make_obj)
         for model in models:
             count = PartPricing.objects.filter(
                 make_ref=make_obj, 
                 model__iexact=model.model_name
             ).update(model_ref=model)
             # if count > 0:
             #    print(f"  Linked {count} records to Model: {model.model_name} ({make_obj.make_name})")

    # 3. Link Part Types
    print("Linking Part Types...")
    part_types = PartType.objects.all()
    for pt in part_types:
        # PartPricing stores 'part_name', matching to PartType.name
        # Flexible matching might be needed 
        count = PartPricing.objects.filter(part_name__iexact=pt.part_name).update(part_type_ref=pt)
        if count > 0:
            print(f"  Linked {count} records to PartType: {pt.part_name}")

    print("Linking Complete.")

if __name__ == "__main__":
    link_data()
