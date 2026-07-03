
import os
import django
import random

# Setup Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from apps.hollander.models import (
    Make, Model, PartPricing, HollanderIndex, 
    HollanderMakeModelRef, HollanderPartRef, PartType
)
from django.db.models import Min, Max

def audit_chain():
    print("--- DEEP AUDIT: Connectivity Chain ---")
    
    # 1. Pick 5 Random Makes that have models
    all_makes = list(Make.objects.all())
    makes = random.sample(all_makes, 5) if len(all_makes) > 5 else all_makes
    
    for make in makes:
        print(f"\n[MAKE] {make.make_name}")
        
        # 2. Pick 3 Models for this Make
        models = list(Model.objects.filter(make=make))
        if not models:
            print("  -> ERROR: No Models found (Schema Gap?)")
            continue
            
        sample_models = random.sample(models, 3) if len(models) > 3 else models
        
        for model in sample_models:
            print(f"  [MODEL] {model.model_name}")
            
            # 3. Get Years (Logic from View)
            # LOGIC REPLICATION: Inventory + Catalog
            valid_years = set()
            
            # A. Inventory
            inv_years = PartPricing.objects.filter(model_ref=model).values_list('year_start', 'year_end')
            for s, e in inv_years:
                if s and e:
                    valid_years.update(range(s, e+1))
                    
            # B. Catalog (Ref Lookup)
            ref_id = None
            ref = HollanderMakeModelRef.objects.filter(h_model__iexact=model.model_name).first()
            if not ref:
                ref = HollanderMakeModelRef.objects.filter(h_model__icontains=model.model_name).first()
            
            if ref:
                ref_id = str(ref.ref_id)
                idx_years = HollanderIndex.objects.filter(model_nm=ref_id).aggregate(min_y=Min('begin_year'), max_y=Max('end_year'))
                if idx_years['min_y']:
                    valid_years.update(range(idx_years['min_y'], idx_years['max_y']+1))
            
            if not valid_years:
                print("    -> ERROR: No Years found (Dead End)")
                # If we have models but no years, that's a user pain point "empty data"
                continue
                
            sorted_years = sorted(list(valid_years), reverse=True)
            print(f"    -> {len(valid_years)} Valid Years found (e.g. {sorted_years[:3]})")
            
            # 4. Check Parts for a specific Year
            test_year = sorted_years[0] # Test the newest year
            
            # LOGIC REPLICATION: Inventory + Catalog Parts
            valid_parts = set()
            
            # A. Inventory Parts
            inv_parts = PartPricing.objects.filter(
                model_ref=model, 
                year_start__lte=test_year, 
                year_end__gte=test_year
            ).values_list('part_type_ref__part_name', flat=True)
            valid_parts.update(inv_parts)
            
            # B. Catalog Parts
            if ref_id:
                cat_codes = HollanderIndex.objects.filter(
                    model_nm=ref_id,
                    begin_year__lte=test_year,
                    end_year__gte=test_year
                ).values_list('part_type_nbr', flat=True).distinct()
                
                cat_names = HollanderPartRef.objects.filter(part_code__in=cat_codes).values_list('part_name', flat=True)
                
                # Fuzzy Match Logic Replicated
                # This is the "Weak Link" I suspect
                # If we have cat_names but they don't map to Dropdown, user sees empty.
                
                # Check mapping success
                mapped_count = 0
                all_parts_simple = set(PartType.objects.values_list('part_name', flat=True))
                
                for c_name in cat_names:
                    # Logic: exact or fuzzy
                    # Simplify checking for audit: does it match any parttype?
                    # Using my View Logic:
                    # 1. Exact
                    # 2. Contains
                    
                    found = False
                    if c_name in all_parts_simple:
                        found = True
                    else:
                        for p in all_parts_simple:
                            if p in c_name: # Simple fuzzy
                                found = True
                                break
                    if found: mapped_count += 1
            
                print(f"      [YEAR {test_year}] Parts: Inv={len(inv_parts)}, CatCodes={len(cat_codes)}, Mapped={mapped_count}")
                
                if len(inv_parts) == 0 and mapped_count == 0:
                    print(f"      -> CRITICAL DEAD END: Year {test_year} has no parts available!")


if __name__ == "__main__":
    audit_chain()
