import requests

print("=== TESTING ALL FRONTEND-BACKEND CONNECTIONS ===\n")

# Test 1: Makes
r1 = requests.get('http://localhost:8000/api/hollander/makes/')
print(f"1. Makes API: {r1.status_code} - {len(r1.json())} makes")

# Test 2: Models (Ford)
r2 = requests.get('http://localhost:8000/api/hollander/models/?make_id=6')
print(f"2. Models API: {r2.status_code} - {len(r2.json())} models")

# Test 3: Years (Ford TAURUS)
r3 = requests.get('http://localhost:8000/api/hollander/years/?make_id=6&model_id=100')
print(f"3. Years API: {r3.status_code} - {len(r3.json())} years")

# Test 4: Parts (Ford TAURUS 2019)
r4 = requests.get('http://localhost:8000/api/hollander/parts/?make_id=6&model_id=100&year=2019')
print(f"4. Parts API: {r4.status_code} - {len(r4.json())} parts")

# Test 5: Hollander Lookup
r5 = requests.post('http://localhost:8000/api/hollander/lookup/', json={
    'year': 2019,
    'make': 'Ford',
    'model': 'TAURUS',
    'part_type': 'Assembly',
    'make_id': 6,
    'model_id': 100
})
data = r5.json()
print(f"5. Lookup API: {r5.status_code} - {data.get('count', 0)} results")
if data.get('results'):
    print(f"   Sample: {data['results'][0]['hollander_number']}")

# Test 6: Vendors
r6 = requests.get('http://localhost:8000/api/vendors/?trusted=true')
vendors = r6.json()
print(f"6. Vendors API: {r6.status_code} - {len(vendors)} vendors")

# Test 7: States
r7 = requests.get('http://localhost:8000/api/common/states/')
states_data = r7.json()
states = states_data.get('results', states_data) if isinstance(states_data, dict) else states_data
print(f"7. States API: {r7.status_code} - {len(states)} states")

print("\n" + "="*50)
if all([r.status_code == 200 for r in [r1, r2, r3, r4, r5, r6, r7]]):
    print("✅ ALL CONNECTIONS WORKING!")
else:
    print("❌ SOME CONNECTIONS FAILED")
