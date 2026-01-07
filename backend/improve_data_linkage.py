
import os
import django
from django.db.models import Q

# Setup Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from apps.hollander.models import PartPricing, Make, Model

def fix_makes():
    print("--- Fixing Make Links ---")
    # Get all distinct make strings from unlinked records
    unlinked_makes = PartPricing.objects.filter(make_ref__isnull=True).values_list('make', flat=True).distinct()
    
    print(f"Found {len(unlinked_makes)} distinct unlinked Make strings.")
    
    mapping = {
        'VW': 'Volkswagen',
        'CHEV': 'Chevrolet',
        'CHEVY': 'Chevrolet',
        'MB': 'Mercedes-Benz',
        # Add others as discovered
    }
    
    for m_str in unlinked_makes:
        if not m_str: continue
        
        target_name = mapping.get(m_str.upper(), m_str)
        
        # Try exact/iexact match
        make_obj = Make.objects.filter(make_name__iexact=target_name).first()
        
        if make_obj:
            count = PartPricing.objects.filter(make=m_str, make_ref__isnull=True).update(make_ref=make_obj)
            print(f"Linked '{m_str}' -> {make_obj.make_name} ({count} records)")
        else:
            print(f"No match for Make string: '{m_str}'")

def fix_models():
    print("\n--- Fixing Model Links ---")
    # Iterate over Makes that have unlinked models
    # We process by Make to scope the model search correctly
    
    makes_with_unlinked = PartPricing.objects.filter(
        make_ref__isnull=False, 
        model_ref__isnull=True
    ).values_list('make_ref', flat=True).distinct()
    
    print(f"Processing models for {len(makes_with_unlinked)} Makes...")
    
    total_linked = 0
    
    for make_id in makes_with_unlinked:
        make_obj = Make.objects.get(pk=make_id)
        
        # Get distinct unlinked model strings for this make
        unlinked_models = PartPricing.objects.filter(
            make_ref=make_obj, 
            model_ref__isnull=True
        ).values_list('model', flat=True).distinct()
        
        # Get all valid models for this make
        valid_models = Model.objects.filter(make=make_obj)
        model_map_lower = {m.model_name.lower(): m for m in valid_models}
        
        # Also create a map stripping spaces/symbols if needed?
        
        for m_str in unlinked_models:
            if not m_str: continue
            
            clean_str = m_str.strip().lower()
            
            match = model_map_lower.get(clean_str)
            
            if match:
                # Update
                cnt = PartPricing.objects.filter(
                    make_ref=make_obj,
                    model=m_str,
                    model_ref__isnull=True
                ).update(model_ref=match)
                total_linked += cnt
                # print(f"  Linked '{m_str}' -> {match.model_name}")
            else:
                # Debugging non-matches (optional, can be noisy)
                # print(f"  No match for '{m_str}' in {make_obj.make_name}")
                pass
                
    print(f"Total Models Linked in this run: {total_linked}")

if __name__ == "__main__":
    fix_makes()
    fix_models()
