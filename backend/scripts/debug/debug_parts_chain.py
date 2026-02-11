
import os
import django

# Setup Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from apps.hollander.models import Model, HollanderMakeModelRef, HollanderIndex, HollanderPartRef

def debug_chain():
    print("--- Debugging BMW 325i Part Logic ---")
    
    # 1. Model
    # Use wildcards to find the model we tested with
    m = Model.objects.filter(model_name__icontains='325i').first()
    print(f"Model: {m.model_name} (ID: {m.model_id})")
    
    # 2. Ref
    ref = HollanderMakeModelRef.objects.filter(h_model__iexact=m.model_name).first()
    if not ref:
        print("Ref Exact: Failed")
        ref = HollanderMakeModelRef.objects.filter(h_model__icontains=m.model_name).first()
        print(f"Ref Contains: {ref.h_model} (ID: {ref.ref_id})" if ref else "Ref Contains: Failed")
    else:
        print(f"Ref Exact: {ref.h_model} (ID: {ref.ref_id})")
        
    if not ref:
        return

    # Debug: Check exact string in DB vs Query
    target_key = ref.h_model.strip() # "BMW 325i"
    print(f"Target Key: '{target_key}'")
    
    # Try finding it via contains
    candidates = HollanderIndex.objects.filter(model_nm__icontains=target_key)[:3]
    print(f"Candidates via Contains: {len(candidates)}")
    for c in candidates:
         print(f"DB: '{c.model_nm}' (Hex: {c.model_nm.encode('utf-8').hex()})")
         print(f"Match? {c.model_nm.lower() == target_key.lower()}")

    # 3. Index Codes
    codes = list(HollanderIndex.objects.filter(
        model_nm__iexact=target_key, 
        begin_year__lte=1990, 
        end_year__gte=1990
    ).values_list('part_type_nbr', flat=True).distinct())
    
    print(f"Codes Found: {len(codes)}")
    print(f"Sample Codes: {codes[:5]}")
    
    if not codes:
        return

    # 4. Part Names (HollanderPartRef)
    names = list(HollanderPartRef.objects.filter(part_code__in=codes).values_list('part_name', flat=True))
    print(f"Names Found: {len(names)}")
    print(f"Sample Names: {names[:5]}")

if __name__ == "__main__":
    debug_chain()
