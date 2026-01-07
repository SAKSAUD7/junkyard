
import os
import django
from django.db import IntegrityError

# Setup Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from apps.hollander.models import PartPricing, Make, Model

def create_missing_models():
    print("--- Creating Missing Models from Pricing Data ---")
    
    # Get unlinked records where Make IS linked
    makes_with_unlinked = PartPricing.objects.filter(
        make_ref__isnull=False, 
        model_ref__isnull=True
    ).values_list('make_ref', flat=True).distinct().order_by()
    
    print(f"Scanning {len(makes_with_unlinked)} Makes for new models...")
    
    total_created = 0
    total_linked = 0
    
    # Get max ID currently in Model table to increment correctly
    # Note: Model.model_id is an IntegerField, potentially legacy ID.
    # We should probably use auto-increment or a high range for new models.
    try:
        max_id = Model.objects.latest('model_id').model_id
    except Model.DoesNotExist:
        max_id = 0
        
    next_id = max_id + 100000 # Buffer to avoid collision with legacy IDs
    
    for make_id in makes_with_unlinked:
        make_obj = Make.objects.get(pk=make_id)
        
        # Get distinct unlinked model strings
        unlinked_models = PartPricing.objects.filter(
            make_ref=make_obj, 
            model_ref__isnull=True
        ).values_list('model', flat=True).distinct().order_by()
        
        created_count = 0
        linked_count = 0
        
        for m_str in unlinked_models:
            if not m_str: continue
            
            # Clean string
            clean_name = m_str.strip()
            if not clean_name: continue
            
            # Check if it exists case-insensitive (double check)
            existing = Model.objects.filter(make=make_obj, model_name__iexact=clean_name).first()
            
            if not existing:
                # CREATE NEW MODEL
                try:
                    existing = Model.objects.create(
                        make=make_obj,
                        model_name=clean_name.title(), # e.g. "TELLURIDE" -> "Telluride"
                        model_id=next_id
                    )
                    next_id += 1
                    created_count += 1
                    # print(f"  Created new model: {clean_name} for {make_obj.make_name}")
                except IntegrityError:
                    # Parallel race condition or duplicate?
                    existing = Model.objects.filter(make=make_obj, model_name__iexact=clean_name).first()
            
            # Link it
            if existing:
                cnt = PartPricing.objects.filter(
                    make_ref=make_obj,
                    model=m_str,
                    model_ref__isnull=True
                ).update(model_ref=existing)
                linked_count += cnt
        
        if created_count > 0:
            print(f" - {make_obj.make_name}: Created {created_count} new models, Linked {linked_count} records")
            
        total_created += created_count
        total_linked += linked_count

    print(f"\nSummary:")
    print(f"Total New Models Created: {total_created}")
    print(f"Total Records Linked: {total_linked}")

if __name__ == "__main__":
    create_missing_models()
