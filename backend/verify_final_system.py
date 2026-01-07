
import os
import django

# Setup Django first
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from rest_framework.test import APIClient
from django.db.models import Count
from apps.hollander.models import Make, Model, PartPricing, HollanderIndex

def verify_system_integrity():
    client = APIClient()
    print("=== FINAL SYSTEM INTEGRITY CHECK ===")
    
    # CASE 1: The "Happy Path" (Inventory + Options)
    print("\n[TEST 1] Inventory Rich Path (Ford Taurus 2013)")
    # Logic: Make -> Model -> Year (Inv) -> Part -> Options
    # 1. Get Make/Model ID
    ford = Make.objects.get(make_name='Ford')
    taurus = Model.objects.filter(model_name='Taurus', make=ford).first()
    
    if not taurus: return print("FAIL: Taurus not found")
    
    # 2. Get Years
    resp = client.get(f'/api/hollander/years/?make_id={ford.make_id}&model_id={taurus.model_id}')
    years = resp.data
    if 2013 in years:
        print(f"  -> Year 2013 Found? YES (Source: {len(years)} years valid)")
    else:
        print("  -> Year 2013 Found? NO (Fail)")
        
    # 3. Get Parts
    resp = client.get(f'/api/hollander/parts/?make_id={ford.make_id}&model_id={taurus.model_id}&year=2013')
    parts = resp.data
    engine = next((p for p in parts if 'Engine' in p['partName']), None)
    if engine:
        print(f"  -> Part 'Engine' Found? YES (ID: {engine['partID']})")
    else:
        print("  -> Part 'Engine' Found? NO (Fail)")
        
    # 4. Lookup (Expect Inventory Options)
    payload = {
        'year': 2013, 'make_id': ford.make_id, 'model_id': taurus.model_id, 
        'part_id': engine['partID'], 'part_type': 'Engine'
    }
    resp = client.post('/api/hollander/lookup/', data=payload, format='json')
    if resp.status_code == 200 and len(resp.data.get('results', [])) > 0:
        res = resp.data['results'][0]
        print(f"  -> Lookup Success? YES")
        print(f"     Source: {res.get('source')} (Expect: inventory)")
        print(f"     Options: {res.get('options')[:50]}...")
    else:
        print("  -> Lookup Success? NO")

    # CASE 2: The "Exception Path" (Catalog Only / Out of Stock)
    print("\n[TEST 2] Catalog Fallback Path (Rare/Old: 1990 BMW 325i)")
    # Logic: Make -> Model -> Year (Cat) -> Part (Fuzzy) -> Hollander # (No Price)
    
    bmw = Make.objects.get(make_name='BMW')
    m325i = Model.objects.filter(model_name__icontains='325i', make=bmw).first()
    
    # 2. Year (Check 1990 is valid via Catalog)
    resp = client.get(f'/api/hollander/years/?make_id={bmw.make_id}&model_id={m325i.model_id}')
    if 1990 in resp.data:
        print("  -> Year 1990 Found? YES (Catalog Mode)")
        
    # 3. Part (Engine - should come from 'Engine Assembly' fuzzy match)
    resp = client.get(f'/api/hollander/parts/?make_id={bmw.make_id}&model_id={m325i.model_id}&year=1990')
    parts = resp.data
    engine_cat = next((p for p in parts if 'Engine' in p['partName']), None)
    if engine_cat:
        print(f"  -> Part 'Engine' Found? YES (Fuzzy Match Success)")
        
    # 4. Lookup (Expect Catalog Fallback)
    payload = {
        'year': 1990, 'make_id': bmw.make_id, 'model_id': m325i.model_id, 
        'part_id': engine_cat['partID'], 'part_type': 'Engine'
    }
    resp = client.post('/api/hollander/lookup/', data=payload, format='json')
    if resp.status_code == 200:
        results = resp.data.get('results', [])
        if results:
            res = results[0]
            print(f"  -> Lookup Success? YES")
            print(f"     Source: {res.get('source')} (Expect: catalog)")
            print(f"     Hollander #: {res.get('hollander_number')}")
            print(f"     Message: {res.get('message')}")
        else:
            print("  -> Lookup Returned Empty (No Interchange Found)")
            
    print("\n=== VERIFICATION COMPLETE ===")

if __name__ == "__main__":
    verify_system_integrity()
