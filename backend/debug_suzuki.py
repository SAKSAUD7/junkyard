
import os
import django
import sys

# Setup Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from apps.hollander.models import Make, Model, PartPricing, HollanderIndex, HollanderMakeModelRef
from apps.hollander.views import query_catalog_index

def debug_suzuki():
    print("--- DEBUG: Suzuki Verona ---")
    
    # 1. Find Make
    make = Make.objects.filter(make_name__iexact='Suzuki').first()
    if not make:
        print("ERROR: Make 'Suzuki' not found")
        return
    print(f"Make: {make.make_name} (ID: {make.make_id})")
    
    # 2. Find Model
    model = Model.objects.filter(model_name__iexact='Verona', make=make).first()
    if not model:
        print("ERROR: Model 'Verona' not found under Suzuki")
        # Try finding anywhere
        vals = Model.objects.filter(model_name__icontains='Verona').values('model_name', 'make__make_name')
        print(f"Partial matches: {list(vals)}")
        return
        
    print(f"Model: {model.model_name} (ID: {model.model_id})")
    
    # 3. Test get_years logic components
    print("\n[A] Check Inventory (PartPricing)")
    inv_count = PartPricing.objects.filter(model_ref=model).count()
    print(f"   Records: {inv_count}")
    if inv_count > 0:
        inv_years = PartPricing.objects.filter(model_ref=model).values_list('year_start', 'year_end')
        print(f"   Sample Years: {list(inv_years)[:5]}")
        
    print("\n[B] Check Catalog (query_catalog_index)")
    # Replicating logic from views.py
    # Debugging query_catalog_index step-by-step
    valid_years, valid_parts = query_catalog_index(make.make_id, model.model_id)
    print(f"   Years Returned: {sorted(list(valid_years))}")
    print(f"   Parts Returned: {len(valid_parts)}")
    
    # Deep Dive: Why empty?
    if not valid_years:
        print("\n[C] DEEP DIVE: Reference Lookup Failure?")
        ref = HollanderMakeModelRef.objects.filter(h_model__iexact=model.model_name).first()
        if not ref:
             ref = HollanderMakeModelRef.objects.filter(h_model__icontains=model.model_name).first()
        
        print(f"   Ref Found: {ref.h_model if ref else 'None'} (ID: {ref.ref_id if ref else 'None'})")
        
        if ref:
            # Check Index manually
            idx_count = HollanderIndex.objects.filter(model_nm=str(ref.ref_id)).count()
            print(f"   Index Count (by Ref ID {ref.ref_id}): {idx_count}")
            
            idx_count_name = HollanderIndex.objects.filter(model_nm__iexact=ref.h_model).count()
            print(f"   Index Count (by Ref Name '{ref.h_model}'): {idx_count_name}")

            idx_count_model = HollanderIndex.objects.filter(model_nm__iexact=model.model_name).count()
            print(f"   Index Count (by Model Name '{model.model_name}'): {idx_count_model}")
            
if __name__ == "__main__":
    debug_suzuki()
