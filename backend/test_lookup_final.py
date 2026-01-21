import requests
import json

url = 'http://localhost:8000/api/hollander/lookup/'

# Test with Ford F250sd Pickup 2019 Assembly
test_payload = {
    'year': 2019,
    'make_id': 16,  # Ford
    'model_id': 101226,  # Ford F250Sd Pickup
    'part_id': 268   # Assembly
}

print("Testing Hollander Lookup - Ford F250sd Pickup 2019 Assembly")
print(f"Payload: {json.dumps(test_payload, indent=2)}")

try:
    response = requests.post(url, json=test_payload)
    print(f"\nStatus: {response.status_code}")
    result = response.json()
    print(f"Response: {json.dumps(result, indent=2)}")
    
    if result.get('results') and len(result['results']) > 0:
        print("\n SUCCESS! Hollander lookup is working!")
        for r in result['results']:
            print(f"  Hollander Number: {r.get('hollander_number')}")
            print(f"  Options: {r.get('options')[:100]}..." if len(r.get('options', '')) > 100 else f"  Options: {r.get('options')}")
    else:
        print("\n Still no results - checking if server reloaded...")
except Exception as e:
    print(f"Error: {e}")
