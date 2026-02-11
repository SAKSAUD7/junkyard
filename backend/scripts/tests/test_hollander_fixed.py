import requests
import json

# Test with Alfa Romeo 4C 2020 Alternator Engine
url = 'http://localhost:8000/api/hollander/lookup/'

test_payload = {
    'year': 2020,
    'make_id': 2,  # Alfa Romeo
    'model_id': 3,  # Alfa-Romeo 4C (need to find correct ID)
    'part_id': 8   # Alternator (need to find correct ID)
}

print("Testing Hollander Lookup with Alfa Romeo...")
print(f"Payload: {json.dumps(test_payload, indent=2)}")

try:
    response = requests.post(url, json=test_payload)
    print(f"\nStatus: {response.status_code}")
    result = response.json()
    print(f"Response: {json.dumps(result, indent=2)}")
    
    if result.get('results'):
        print("\n✅ SUCCESS! Found Hollander data:")
        for r in result['results']:
            print(f"  Hollander#: {r.get('hollander_number')}")
            print(f"  Options: {r.get('options')}")
    else:
        print("\n⚠️  No results found - may need correct model/part IDs")
except Exception as e:
    print(f"Error: {e}")
