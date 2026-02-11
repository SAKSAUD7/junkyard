
import os
import django
from django.test import RequestFactory

# Setup Django first
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from apps.hollander import views
from apps.hollander.models import Make, Model, HollanderMakeModelRef

def verify_parts_filtering():
    factory = RequestFactory()
    
    print("--- 1. Testing Catalog-Only Filtering (BMW 325i, 1990) ---")
    bmw = Make.objects.filter(make_name__icontains='BMW').first()
    bmw_model = Model.objects.filter(model_name__icontains='325i', make=bmw).first()
    
    if bmw and bmw_model:
        print(f"Testing with Model: {bmw_model.model_name}")
        request = factory.get(f'/api/hollander/parts/?make_id={bmw.make_id}&model_id={bmw_model.model_id}&year=1990')
        response = views.get_parts(request)
        data = response.data
        print(f"Parts Found: {len(data)}")
        if len(data) < 300 and len(data) > 0:
            print("SUCCESS: Filtered list returned (Subset of full list).")
            names = [p['partName'] for p in data]
            print(f"Sample: {names[:5]}")
            if "Engine" in names:
                print("SUCCESS: 'Engine' found in filtered list (Fuzzy Match Worked).")
            else:
                print("FAILURE: 'Engine' NOT found in filtered list.")
        elif len(data) >= 300:
            print("FAILURE: Full list returned (Fallback triggered). Catalog lookup failed.")
        else:
             print("FAILURE: Empty list returned.")
    else:
        print("Skipping - BMW 325i not found")

    print("\n--- 2. Testing Invalid Vehicle (Expect Full Fallback) ---")
    request = factory.get(f'/api/hollander/parts/?make_id=99999&model_id=99999&year=2020')
    response = views.get_parts(request)
    if len(response.data) > 300:
        print("SUCCESS: Full list returned (Fallback).")
    else:
        print(f"Unexpected count: {len(response.data)}")

if __name__ == "__main__":
    verify_parts_filtering()
