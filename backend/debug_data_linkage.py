
import os
import django
import sys

# Setup Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from apps.hollander.models import PartPricing, Make, Model

def run_debug():
    total = PartPricing.objects.count()
    linked_makes = PartPricing.objects.filter(make_ref__isnull=False).count()
    linked_models = PartPricing.objects.filter(model_ref__isnull=False).count()
    
    print(f"Total Pricing Records: {total}")
    print(f"Records with Make Linked: {linked_makes}")
    print(f"Records with Model Linked: {linked_models}")
    
    # Check specifically for Kia
    kia_makes = Make.objects.filter(make_name__icontains='Kia')
    print(f"\nKia Makes found: {kia_makes.count()}")
    for k in kia_makes:
        print(f" - {k.make_name} (ID: {k.make_id})")
        # Check linkage
        linked_count = PartPricing.objects.filter(make_ref=k).count()
        print(f"   PartPricing records linked to this make: {linked_count}")
        
        # Check string match vs linked
        string_matches = PartPricing.objects.filter(make__iexact=k.make_name).count()
        print(f"   PartPricing records with string '{k.make_name}': {string_matches}")

    # Check for orphaned Models
    print("\nSample Unlinked Records (first 5):")
    unlinked = PartPricing.objects.filter(make_ref__isnull=True)[:5]
    for u in unlinked:
        print(f" - ID: {u.id}, Make: '{u.make}', Model: '{u.model}'")

if __name__ == "__main__":
    run_debug()
