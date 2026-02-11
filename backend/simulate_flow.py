
import os
import django
from django.test import RequestFactory
import json

# Setup Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from apps.hollander import views
from apps.leads.views import hollander_lookup

from rest_framework.test import APIClient

def simulate_full_user_flow():
    client = APIClient()
    print("--- SIMULATION: Full User Journey (Unified Data) ---")
    
    # 1. Select Make (BMW)
    print("\n[1] Select Make: BMW")
    # APIClient.get returns a Response object directly
    resp = client.get('/api/hollander/makes/')
    if resp.status_code != 200:
        print(f"FAILED: Status {resp.status_code}")
        print(f"Content: {resp.content}")
        return
        
    all_makes = resp.data
    bmw = next((m for m in all_makes if m['makeName'] == 'BMW'), None)
    if not bmw: return print("BMW not found");
    print(f"    -> ID: {bmw['makeID']}")
    
    # 2. Select Model (325i) - Dependent on Make
    print("\n[2] Select Model: 325i")
    resp = client.get(f'/api/hollander/models/?make_id={bmw["makeID"]}')
    models = resp.data
    model_325i = next((m for m in models if "325i" in m['modelName']), None)
    if not model_325i: return print("325i not found");
    print(f"    -> ID: {model_325i['modelID']} ({model_325i['modelName']})")

    # 3. Select Year (1990) - Dependent on Make + Model
    print("\n[3] Select Year: 1990")
    resp = client.get(f'/api/hollander/years/?make_id={bmw["makeID"]}&model_id={model_325i["modelID"]}')
    years = resp.data
    if 1990 in years:
        print("    -> 1990 is Valid (Found in Dependent List)")
    else:
        print(f"    -> ERROR: 1990 not found in years: {years[:5]}...")
        return
        
    # 4. Select Part (Engine) - Dependent on Make + Model + Year
    print("\n[4] Select Part: Engine")
    resp = client.get(f'/api/hollander/parts/?make_id={bmw["makeID"]}&model_id={model_325i["modelID"]}&year=1990')
    parts = resp.data
    engine_part = next((p for p in parts if "Engine" in p['partName']), None)
    
    if engine_part:
        print(f"    -> Found Part: {engine_part['partName']} (ID: {engine_part['partID']})")
    else:
        print("    -> ERROR: 'Engine' part not found in filtered list.")
        return

    # 5. Get Pricing/Options (Lookup) - Final Step
    print("\n[5] Get Pricing/Options")
    payload = {
        'year': 1990,
        'make_id': bmw['makeID'],
        'model_id': model_325i['modelID'],
        'part_id': engine_part['partID'],
        'part_type': engine_part['partName']
    }
    resp = client.post('/api/hollander/lookup/', data=payload, format='json')
    lookup_res = resp # Is already Response
    results = lookup_res.data.get('results', [])
    results = lookup_res.data.get('results', [])
    
    print(f"    -> Results Found: {len(results)}")
    if results:
        first = results[0]
        print(f"       Source: {first.get('source')}")
        print(f"       Hollander #: {first.get('hollander_number')}")
        print(f"       Options: {first.get('options')}")
        
    print("\n--- SIMULATION COMPLETE ---")

if __name__ == "__main__":
    simulate_full_user_flow()
