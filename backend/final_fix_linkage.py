
import os
import django
from django.db.models import Q

# Setup Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from apps.hollander.models import PartPricing, Make, Model

def final_fix_makes():
    print("--- Fixing Make Links ---")
    unlinked_makes = PartPricing.objects.filter(make_ref__isnull=True).values_list('make', flat=True).distinct().order_by()
    
    print(f"Found {len(unlinked_makes)} distinct unlinked Make strings.")
    
    mapping = {
        'VW': 'Volkswagen',
        'CHEV': 'Chevrolet',
        'CHEVY': 'Chevrolet',
        'MB': 'Mercedes-Benz',
        'MERCEDES': 'Mercedes-Benz',
        'MU': 'Mitsubishi',
        'MZ': 'Mazda',
        'IF': 'Infiniti',
        'TY': 'Toyota',
        'HO': 'Honda',
        'NI': 'Nissan',
        'NIS': 'Nissan',
        'TOY': 'Toyota',
        'SUZ': 'Suzuki',
        'SUB': 'Subaru',
        'HYU': 'Hyundai',
        'JAG': 'Jaguar',
        'POR': 'Porsche',
        'SAA': 'Saab',
        'VOL': 'Volvo',
        'LEX': 'Lexus',
        'ROV': 'Land Rover',
        'LR': 'Land Rover',
        'ISU': 'Isuzu',
        'KIA': 'Kia',
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
            # print(f"No match for Make string: '{m_str}'")
            pass

def final_fix_models():
    print("\n--- Fixing Model Links ---")
    
    # Correct distinct query
    makes_with_unlinked = PartPricing.objects.filter(
        make_ref__isnull=False, 
        model_ref__isnull=True
    ).values_list('make_ref', flat=True).distinct().order_by()
    
    print(f"Processing models for {len(makes_with_unlinked)} Makes...")
    
    total_linked = 0
    
    for make_id in makes_with_unlinked:
        make_obj = Make.objects.get(pk=make_id)
        
        # Get distinct unlinked model strings
        unlinked_models = PartPricing.objects.filter(
            make_ref=make_obj, 
            model_ref__isnull=True
        ).values_list('model', flat=True).distinct().order_by()
        
        # Get all valid models for this make
        valid_models = Model.objects.filter(make=make_obj)
        model_map_lower = {m.model_name.lower(): m for m in valid_models}
        
        # Fuzzy map: remove spaces, etc
        model_map_fuzzy = {m.model_name.replace(' ', '').lower(): m for m in valid_models}
        
        count_for_make = 0
        
        for m_str in unlinked_models:
            if not m_str: continue
            
            clean_str = m_str.strip().lower()
            fuzzy_str = clean_str.replace(' ', '')
            
            match = model_map_lower.get(clean_str)
            if not match:
                match = model_map_fuzzy.get(fuzzy_str)
            
            if match:
                # Update
                cnt = PartPricing.objects.filter(
                    make_ref=make_obj,
                    model=m_str,
                    model_ref__isnull=True
                ).update(model_ref=match)
                total_linked += cnt
                count_for_make += cnt
            
        if count_for_make > 0:
            print(f" - {make_obj.make_name}: Linked {count_for_make} models")

    print(f"Total Models Linked in this run: {total_linked}")

if __name__ == "__main__":
    final_fix_makes()
    final_fix_models()
