
import os
import django
from django.test import RequestFactory

# Setup Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from apps.hollander import views

def verify_api_suzuki():
    print("--- VERIFYING API VIEW: get_years (Suzuki Verona) ---")
    factory = RequestFactory()
    
    # Simulate: /api/hollander/years/?make_id=49&model_id=750
    request = factory.get('/api/hollander/years/?make_id=49&model_id=750')
    request.query_params = request.GET
    
    response = views.get_years(request)
    
    with open('api_result.txt', 'w') as f:
        f.write(f"Status Code: {response.status_code}\n")
        f.write(f"Data Len: {len(response.data)}\n")
        f.write(f"Data Sample: {response.data[:5]}\n")
        
    print(f"Status Code: {response.status_code}")
    print(f"Data: {response.data}")
    
    if len(response.data) > 0:
        print("SUCCESS: View returned years.")
    else:
        print("FAILURE: View returned empty list.")
        
if __name__ == "__main__":
    verify_api_suzuki()
