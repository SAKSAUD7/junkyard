
import os
import django
from django.db.models import Min, Max

# Setup Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from apps.hollander.models import Model, PartPricing, HollanderMakeModelRef, HollanderIndex

def analyze_coverage():
    print("--- Analyzing Year Coverage for Models ---")
    
    # Sample models (e.g., first 100 or random)
    models = Model.objects.all().order_by('model_name')[:200] 
    
    total = 0
    with_inventory = 0
    with_catalog = 0
    zero_coverage = 0
    
    print(f"Scanning {len(models)} models...")
    
    for m in models:
        total += 1
        has_inv = False
        has_cat = False
        
        # 1. Check Inventory
        inv_count = PartPricing.objects.filter(model_ref=m).count()
        if inv_count > 0:
            has_inv = True
            with_inventory += 1
            
        # 2. Check Catalog (The Logic used in views.py)
        if not has_inv:
             # Try stricter name match first
            ref = HollanderMakeModelRef.objects.filter(h_model__iexact=m.model_name).first()
            if not ref:
                # Try contains
                ref = HollanderMakeModelRef.objects.filter(h_model__icontains=m.model_name).first()
            
            if ref:
                idx_exists = HollanderIndex.objects.filter(model_nm=str(ref.ref_id)).exists()
                if idx_exists:
                    has_cat = True
                    with_catalog += 1
        
        if not has_inv and not has_cat:
            zero_coverage += 1
            print(f"[MISSING] {m.make.make_name} {m.model_name}")

    print("\n--- Summary ---")
    print(f"Total Scanned: {total}")
    print(f"With Inventory Years: {with_inventory}")
    print(f"With Catalog Years (Fallback): {with_catalog}")
    print(f"ZERO Coverage (Blank Dropdown): {zero_coverage}")

if __name__ == "__main__":
    analyze_coverage()
