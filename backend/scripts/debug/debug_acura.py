import os
import django

# Setup Django first
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from django.conf import settings
settings.ALLOWED_HOSTS += ['testserver']

from rest_framework.test import APIClient
from apps.hollander.models import Make, Model, PartType, HollanderIndex

def debug_acura():
    client = APIClient()
    
    print("\n--- DEBUG: Acura Integra 2023 Brake Booster Check ---")
    
    # 1. Find IDs
    # Acura (Make)
    acura = Make.objects.filter(make_name__icontains='Acura').first()
    if not acura: return print("FAIL: Acura Make not found")
    
    # Integra (Model)
    integra = Model.objects.filter(make=acura, model_name__iexact='Integra').first()
    if not integra: integra = Model.objects.filter(make=acura, model_name__icontains='Integra').first()
    if not integra: return print("FAIL: Integra Model not found")
    
    # Brake Booster (Part) - Try "Brake Booster" or "Booster"
    part_name = "Brake Booster"
    part = PartType.objects.filter(part_name__iexact=part_name).first()
    if not part:
        part = PartType.objects.filter(part_name__icontains=part_name).first()
        
    if not part: return print(f"FAIL: Part '{part_name}' not found")
    
    print(f"IDs: Make={acura.make_id} ({acura.make_name}), Model={integra.model_id} ({integra.model_name}), Part={part.part_id} ({part.part_name})")
    
    # 2. Check Data Existence (Direct Query)
    # Check Catalog Coverage for 2023
    print("\n[Direct DB Check]")
    catalog_count = HollanderIndex.objects.filter(
        begin_year__lte=2023, 
        end_year__gte=2023
    ).count()
    print(f"Total Catalog Entries covering 2023 (Any Model): {catalog_count}")
    
    # Check Specific Model Coverage
    # We need the Ref ID for Integra
    from apps.hollander.models import HollanderMakeModelRef
    refs = HollanderMakeModelRef.objects.filter(h_model__icontains='Integra')
    print(f"Integra Refs found: {refs.count()}")
    for r in refs:
        idx_count = HollanderIndex.objects.filter(model_nm=str(r.ref_id), begin_year__lte=2023, end_year__gte=2023).count()
        print(f"  - Ref {r.ref_id} ({r.h_model}): {idx_count} entries for 2023")

    # 3. Process via API
    print("\n[API Lookup]")
    payload = {
        'year': 2023,
        'make_id': acura.make_id,
        'model_id': integra.model_id,
        'part_id': part.part_id,
        'part_type': part.part_name,
        'make': acura.make_name,
        'model': integra.model_name
    }
    
    try:
        resp = client.post('/api/hollander/lookup/', data=payload, format='json')
        if resp.status_code == 200:
            data = resp.data
            count = data.get('count', 0)
            print(f"\n[FINAL RESULT] Count: {count}")
            if count > 0:
                res = data['results'][0]
                print(f"  - Number: {res.get('hollander_number')}")
                print(f"  - Options: {res.get('options')}")
                print(f"  - Source: {res.get('source')}")
        else:
            print(f"[FINAL RESULT] Failed Status: {resp.status_code}")
            print(resp.content)
    except Exception as e:
        print(f"API Crash: {e}")

if __name__ == "__main__":
    debug_acura()
