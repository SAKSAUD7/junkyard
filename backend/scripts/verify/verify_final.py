
import os
import django
from django.test import RequestFactory

# Setup Django first
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from apps.hollander import views
from apps.hollander.models import Make, Model

def verify_final():
    factory = RequestFactory()
    
    print("--- 1. Testing Catalog-Only Filtering (BMW 325i, 1990) ---")
    bmw = Make.objects.filter(make_name__icontains='BMW').first()
    bmw_model = Model.objects.filter(model_name__icontains='325i', make=bmw).first()
    
    if bmw and bmw_model:
        request = factory.get(f'/api/hollander/parts/?make_id={bmw.make_id}&model_id={bmw_model.model_id}&year=1990')
        response = views.get_parts(request)
        data = response.data
        
        count = len(data)
        print(f"Parts Found: {count}")
        print(f"Sample Names: {[p['partName'] for p in data[:5]]}")
        
        if count < 350 and count > 0:
            print("SUCCESS: Filtered list returned.")
        elif count >= 350:
            print("WARNING: Full/Near-Full list returned. Might be fallback or loose fuzzy match.")
        else:
             print("FAILURE: Empty list.")
    else:
        print("Skipping - BMW 325i not found")

if __name__ == "__main__":
    verify_final()
