import os
import django
import sys

sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.hollander.models import Make, Model, PartPricing, HollanderMakeModelRef, HollanderIndex

print("Analyzing all makes for data availability...\n")

all_makes = Make.objects.all().order_by('make_name')
empty_makes = []
partial_makes = []
full_makes = []

for make in all_makes:
    # Check inventory
    inventory_count = PartPricing.objects.filter(make_ref=make).count()
    
    # Check catalog refs
    # We need to check if ANY of this make's models appear in refs
    models = Model.objects.filter(make=make)
    model_names = [m.model_name for m in models]
    
    # Search for refs matching these model names
    ref_count = 0
    for model_name in model_names[:10]:  # Sample first 10 to avoid huge queries
        ref_count += HollanderMakeModelRef.objects.filter(h_model__icontains=model_name).count()
        if ref_count > 0:
            break
    
    # Categorize
    if inventory_count == 0 and ref_count == 0:
        empty_makes.append(make.make_name)
    elif inventory_count > 0 and ref_count > 0:
        full_makes.append(f"{make.make_name} (Inventory: {inventory_count}, Refs: Yes)")
    else:
        partial_makes.append(f"{make.make_name} (Inventory: {inventory_count}, Refs: {'Yes' if ref_count > 0 else 'No'})")

print(f"=== SUMMARY ===")
print(f"Total Makes: {all_makes.count()}")
print(f"Makes with FULL data: {len(full_makes)}")
print(f"Makes with PARTIAL data: {len(partial_makes)}")
print(f"Makes with NO data: {len(empty_makes)}")

print(f"\n=== MAKES WITH NO DATA (Empty) ===")
for make in empty_makes:
    print(f"  - {make}")

print(f"\n=== MAKES WITH PARTIAL DATA ===")
for make in partial_makes[:20]:  # Show first 20
    print(f"  - {make}")
if len(partial_makes) > 20:
    print(f"  ... and {len(partial_makes) - 20} more")
