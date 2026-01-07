import requests
import json

# Test AMC Alliance 1985 - Air Bag Control Module
print("Testing: AMC Alliance 1985 - Air Bag Control Module")
response = requests.post(
    'http://localhost:8000/api/hollander/lookup/',
    json={
        'year': 1985,
        'make': 'AMC',
        'model': 'Alliance',
        'part_type': 'Air Bag Control Module'
    }
)

print(f"Status: {response.status_code}")
data = response.json()
print(f"Results: {data.get('count', 0)}")
if data.get('results'):
    for r in data['results'][:3]:
        print(f"  - {r['hollander_number']}: {r['options']}")
else:
    print("  No results found")
