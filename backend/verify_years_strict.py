
import os
import django
from django.test import RequestFactory

# Setup Django first
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from apps.hollander import views
from apps.hollander.models import Make, Model, HollanderMakeModelRef

def verify_strict_years():
    factory = RequestFactory()
    
    print("--- 1. Testing Valid Inventory Vehicle (Kia Optima) ---")
    kia = Make.objects.filter(make_name__iexact='Kia').first()
    optima = Model.objects.filter(model_name__icontains='Optima', make=kia).first()
    
    if kia and optima:
        request = factory.get(f'/api/hollander/years/?make_id={kia.make_id}&model_id={optima.model_id}')
        response = views.get_years(request)
        print(f"Kia Optima Years: {response.data}")
    else:
        print("Skipping - Kia Optima not found")


    print("\n--- 2. Testing Catalog-Only Vehicle (Chrysler PLYMOUTH 300 VAN) ---")
    # We found Ref ID 1000 for this earlier
    v_ref = HollanderMakeModelRef.objects.filter(ref_id=1000).first()
    if v_ref:
        # Find corresponding Model object if it exists?
        # Since we use Model ID in API, we need to mimic a frontend call.
        # But our Model table might not match 'PLYMOUTH 300 VAN' exactly.
        # Let's try to query by ID if we can find the matching Model in our DB.
        
        # Reverse check: Find a Model in our DB that maps to a Ref that has specific years
        pass
    
    # Let's try 'Accord' again since we know Ref 523 exists
    # We need to find the Model object for Accord
    honda = Make.objects.filter(make_name__icontains='Honda').first()
    accord = Model.objects.filter(model_name__iexact='Accord', make=honda).first()
    
    if honda and accord:
        request = factory.get(f'/api/hollander/years/?make_id={honda.make_id}&model_id={accord.model_id}')
        response = views.get_years(request)
        print(f"Honda Accord Years: {response.data[:10]}...") 
        if len(response.data) > 40:
             print("(Showing subset)")
    else:
        print("Skipping - Honda Accord not found")

    print("\n--- 3. Testing BMW 325i (Catalog Only - String Match) ---")
    bmw = Make.objects.filter(make_name__icontains='BMW').first()
    b_model = Model.objects.filter(model_name__icontains='325i', make=bmw).first()
    
    if bmw and b_model:
        request = factory.get(f'/api/hollander/years/?make_id={bmw.make_id}&model_id={b_model.model_id}')
        response = views.get_years(request)
        print(f"BMW 325i Years: {response.data[:10]}...")
    else:
        print("Skipping - BMW 325i not found")

    print("\n--- 4. Testing Non-Existent Vehicle (Should be Empty) ---")
    # Make ID 99999, Model ID 99999
    request = factory.get(f'/api/hollander/years/?make_id=99999&model_id=99999')
    response = views.get_years(request)
    print(f"Invalid Vehicle Years: {response.data}")
    if response.data == []:
        print("SUCCESS: Empty list returned (No fallback).")
    else:
        print("FAILURE: Fallback list returned!")

if __name__ == "__main__":
    verify_strict_years()
