
import os
import django

# Setup Django first
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from django.conf import settings
settings.ALLOWED_HOSTS += ['testserver']

from rest_framework.test import APIClient
from apps.hollander.models import Make, Model, PartType

def debug_lookup_failure():
    client = APIClient()
    print("--- DEBUG: Hollander Lookup Logic ---")
    
    # CASE 1: Catalog Fallback (BMW 325i 1990 Engine)
    print("\n[TEST 1] BMW 325i 1990 Engine (Catalog Mode)")
    
    # Get IDs (Resilient)
    bmw = Make.objects.filter(make_name__icontains='BMW').first()
    if not bmw: return print("FAIL: BMW Make not found")
    
    # Precise Model finding
    m325i = Model.objects.filter(make=bmw, model_name='325i').first()
    if not m325i: m325i = Model.objects.filter(make=bmw, model_name__icontains='325i').first()
    if not m325i: return print("FAIL: BMW 325i Model not found")
    
    # Precise Part finding (Use a known valid part from previous debugging)
    engine = PartType.objects.filter(part_name='Engine Assembly').first()
    if not engine: 
        # Fallback if ID changed
        engine = PartType.objects.filter(part_name__icontains='Engine Assembly').first()
        
    if not engine: return print("FAIL: 'Engine Assembly' Part not found")
    
    print(f"  IDs: Make={bmw.make_id}, Model={m325i.model_id}, Part={engine.part_id} ({engine.part_name})")
    
    payload = {
        'year': 1990,
        'make_id': bmw.make_id,
        'model_id': m325i.model_id,
        'part_id': engine.part_id,
        'part_type': engine.part_name
    }
    
    resp = client.post('/api/hollander/lookup/', data=payload, format='json')
    print(f"  Status: {resp.status_code}")
    
    if resp.status_code != 200:
        print(f"  FAILED Status: {resp.status_code}")
        with open('lookup_error.html', 'wb') as f:
            f.write(resp.content)
        print("  Error content saved to lookup_error.html")
        return

    results = resp.data.get('results', [])
    print(f"  Results Count: {len(results)}")
    if results:
        print(f"  Sample: {results[0]}")
    else:
        print("  FAILURE: No results returned.")
            
    # CASE 2: Inventory Mode (Ford Taurus 2013 Engine - check if this works)
    print("\n[TEST 2] Ford Taurus 2013 Engine (Inventory Mode)")
    ford = Make.objects.filter(make_name='Ford').first()
    taurus = Model.objects.filter(model_name='Taurus', make=ford).first()
    
    if ford and taurus:
        payload2 = {
            'year': 2013,
            'make_id': ford.make_id,
            'model_id': taurus.model_id,
            'part_id': engine.part_id,
            'part_type': engine.part_name
        }
        resp = client.post('/api/hollander/lookup/', data=payload2, format='json')
        print(f"  Status: {resp.status_code}")
        print(f"  Results: {len(resp.data.get('results', []))}")

if __name__ == "__main__":
    debug_lookup_failure()
