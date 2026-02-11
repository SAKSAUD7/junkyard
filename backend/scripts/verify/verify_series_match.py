
import os
import django
import sys
import requests

# Standalone setup not needed if we use manage.py shell, but useful for logic test
# Here we test the API endpoint directly

def verify_api():
    base_url = "http://localhost:8000/api/hollander/vehicle-data"
    
    # Test Cases
    cases = [
        ("Mercedes Benz", "190E", "190"), # Local Make, Local Model, Expected Series/Ref Concept
        ("BMW", "325i", "325"),
        ("AMC", "Alliance", "RENAULT ALLIANCE"), # Regression test
        ("AMC", "Concord", "CONCORD") # New test for Split-Make issue
    ]
    
    # 1. Get Make IDs
    print("Fetching Makes...")
    r = requests.get("http://localhost:8000/api/hollander/makes/")
    makes = r.json()
    
    for make_name, model_name, expected_token in cases:
        print(f"\n--- Testing {make_name} : {model_name} ---")
        make_obj = next((m for m in makes if m['makeName'] == make_name), None)
        
        if not make_obj:
            print(f"Make {make_name} not found!")
            continue
            
        make_id = make_obj['makeID']
        print(f"Make ID: {make_id}")
        
        # 2. Bulk Fetch
        r = requests.get(f"{base_url}/{make_id}/")
        
        if r.status_code != 200:
            print(f"Error fetching data: {r.status_code}")
            continue
            
        data = r.json()
        
        # 3. Find Model
        model_data = next((m for m in data['models'] if model_name in m['model_name']), None)
        
        if not model_data:
            print(f"Model {model_name} not found in response models.")
            # Print first 5 models to see what we got
            print(f"Available models sample: {[m['model_name'] for m in data['models'][:5]]}")
            continue
            
        print(f"Found Model: {model_data['model_name']}")
        print(f"Years: {model_data['years']}")
        
        if model_data['years']:
            print("PASS: Years found.")
            # Check Parts for first year
            first_year = str(model_data['years'][0])
            parts = model_data['parts'].get(first_year, [])
            print(f"Parts for {first_year}: {len(parts)} found.")
            if parts:
                print(f"Sample Part: {parts[0]}")
            else:
                print("FAIL: No parts found for year.")
        else:
            print("FAIL: No years found.")

if __name__ == "__main__":
    verify_api()
