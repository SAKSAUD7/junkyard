import requests
import json
import random

BASE_URL = 'http://localhost:8000/api'

def run():
    print("Fetching makes...")
    makes = requests.get(f"{BASE_URL}/hollander/makes/").json()
    makes = makes[:5] # limit to first a few makes
    for make in makes:
        make_id = make['makeID']
        make_name = make['makeName']
        print(f"Testing make {make_name} ({make_id})")
        
        # Get Vehicle Bulk Data
        cache = requests.get(f"{BASE_URL}/hollander/vehicle-data/{make_id}/").json()
        models = cache.get('models', [])
        
        # Get Global Parts (Simulate loadMakes)
        parts = requests.get(f"{BASE_URL}/hollander/parts/?make_id={make_id}").json()
        
        for m in models[:5]: # testing a few models
            model_id = m['model_id']
            model_name = m['model_name']
            years = m.get('years', [])
            for year in years[:3]:
                # Pick a random part from global parts
                if not parts:
                    continue
                p = parts[0]
                selectedPart = str(p['partID'])
                rawName = p['partName']
                
                # Simulate frontend logic
                selectedYear = str(year)
                
                # Part matching in frontend
                partObj = None
                if 'parts' in m and selectedYear in m['parts']:
                    # Frontend searches parts array looking for part_id
                    yp = m['parts'][selectedYear]
                    for part_item in yp:
                        if str(part_item['part_id']) == selectedPart:
                            partObj = part_item
                            break
                            
                if partObj:
                    selectedPartName = partObj['part_name']
                else:
                    selectedPartName = rawName.split(' (')[0].strip()
                    
                finalPart = selectedPartName or selectedPart or ''
                if partObj:
                    finalPart = partObj['part_name']
                    
                payload = {
                    "make": make_name,
                    "model": model_name,
                    "year": int(selectedYear) if selectedYear else None,
                    "name": "John Doe",
                    "email": "johndoe@example.com",
                    "phone": "555-555-5555",
                    "state": "CA",
                    "zip": "90210",
                    "part": finalPart.split(' (')[0].strip(),
                    "lead_type": "quality_auto_parts",
                    "options": "",
                    "hollander_number": "",
                    "hollander_candidates": []
                }
                
                res = requests.post(f"{BASE_URL}/leads/", json=payload)
                if res.status_code == 400:
                    print(f"FAILED (400) for Make:{make_name} Model:{model_name} Year:{selectedYear} Part:{finalPart}")
                    print(f"Payload: {payload}")
                    print(f"Errors: {res.json()}")
                    return
                elif res.status_code != 201:
                    print(f"UNEXPECTED {res.status_code}")
                    
    print("All tests passed.")
    
run()
