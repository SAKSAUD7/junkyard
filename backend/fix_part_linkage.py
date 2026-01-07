
import os
import django
from django.db import IntegrityError

# Setup Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from apps.hollander.models import PartPricing, PartType

def fix_part_linkage():
    print("--- Fixing PartType Linkage ---")
    
    # 1. Get all distinct part strings from unlinked records
    # We want to create PartType for every unique part_name that isn't linked
    print("Scanning for unlinked parts...")
    unlinked_parts = PartPricing.objects.filter(part_type_ref__isnull=True).values_list('part_name', flat=True).distinct().order_by()
    
    print(f"Found {len(unlinked_parts)} distinct unlinked Part strings.")
    
    # Get max ID for new parts
    try:
        max_id = PartType.objects.latest('part_id').part_id
    except PartType.DoesNotExist:
        max_id = 1000
    
    next_id = max_id + 1
    
    total_created = 0
    total_linked = 0
    
    for p_str in unlinked_parts:
        if not p_str: continue
        
        clean_name = p_str.strip()
        if not clean_name: continue
        
        # Check if exists case-insensitive
        existing = PartType.objects.filter(part_name__iexact=clean_name).first()
        
        if not existing:
            # Create it
            try:
                existing = PartType.objects.create(
                    part_name=clean_name,
                    # slug field does not exist in model
                    part_id=next_id # Assign new ID
                )
                next_id += 1
                total_created += 1
                # print(f"Created PartType: {clean_name}")
            except IntegrityError:
                existing = PartType.objects.filter(part_name__iexact=clean_name).first()
        
        # Link it in bulk
        if existing:
            count = PartPricing.objects.filter(
                part_name=p_str, 
                part_type_ref__isnull=True
            ).update(part_type_ref=existing)
            
            total_linked += count
            
    print(f"\nSummary:")
    print(f"Total New PartTypes Created: {total_created}")
    print(f"Total Pricing Records Linked: {total_linked}")

if __name__ == "__main__":
    fix_part_linkage()
