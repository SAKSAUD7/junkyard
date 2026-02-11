
import os
import django
import json
from django.conf import settings

# Setup Django first
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from django.test import RequestFactory
from rest_framework.test import force_authenticate
from apps.hollander import views
from apps.hollander.models import Make


def test_api():
    factory = RequestFactory()
    
    print("--- 1. Testing GET Makes ---")
    request = factory.get('/api/hollander/makes/')
    response = views.get_makes(request)
    if response.status_code != 200:
        print(f"FAILED: {response.status_code}")
        return
        
    makes = response.data
    print(f"Found {len(makes)} makes.")
    if not makes:
        print("ERROR: No makes returned!")
        return
        
    # Pick "Kia" or first one
    target_make = next((m for m in makes if m['makeName'].lower() == 'kia'), makes[0])
    make_id = target_make['makeID']
    make_name = target_make['makeName']
    print(f"Selected Make: {make_name} (ID: {make_id})")
    
    
    print(f"\n--- 2. Testing GET Models (make_id={make_id}) ---")
    request = factory.get(f'/api/hollander/models/?make_id={make_id}')
    response = views.get_models(request)
    models = response.data
    print(f"Found {len(models)} models.")
    
    if not models:
        print("ERROR: No models returned! (Chain Broken Here)")
        # Debug why
        from apps.hollander.models import PartPricing
        count = PartPricing.objects.filter(make_ref__make_id=make_id).count()
        print(f"DEBUG: PartPricing records for make_id={make_id}: {count}")
        return

    # Pick "Optima" or first one
    target_model = next((m for m in models if 'optima' in m['modelName'].lower()), models[0])
    model_id = target_model['modelID']
    model_name = target_model['modelName']
    print(f"Selected Model: {model_name} (ID: {model_id})")


    print(f"\n--- 3. Testing GET Years (make_id={make_id}, model_id={model_id}) ---")
    request = factory.get(f'/api/hollander/years/?make_id={make_id}&model_id={model_id}')
    response = views.get_years(request)
    years = response.data
    print(f"Found {len(years)} years: {years[:5]}...")
    
    if not years:
        print("ERROR: No years returned! (Chain Broken Here)")
        return
        
    target_year = years[0]
    print(f"Selected Year: {target_year}")


    print(f"\n--- 4. Testing GET Parts (make_id={make_id}, model_id={model_id}, year={target_year}) ---")
    request = factory.get(f'/api/hollander/parts/?make_id={make_id}&model_id={model_id}&year={target_year}')
    response = views.get_parts(request)
    parts = response.data
    print(f"Found {len(parts)} parts.")
    
    if not parts:
        print("ERROR: No parts returned! (Chain Broken Here)")
        return
        
    print("\nSUCCESS: Full chain is working on Backend.")

if __name__ == "__main__":
    test_api()
