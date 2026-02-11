import requests
import json

# Test 1: Ford TAURUS Assembly
print("="*70)
print("TEST 1: Ford TAURUS Assembly (2019)")
print("="*70)

payload1 = {
    "year": 2019,
    "make": "Ford",
    "model": "TAURUS",
    "part_type": "Assembly"
}

response1 = requests.post(
    'http://localhost:8000/api/hollander/lookup/',
    json=payload1,
    headers={'Content-Type': 'application/json'}
)

print(f"Status Code: {response1.status_code}")
print(f"Response: {json.dumps(response1.json(), indent=2)}\n")

# Test 2: Alfa Romeo 4C Grille
print("="*70)
print("TEST 2: Alfa Romeo 4C Grille (2019)")
print("="*70)

payload2 = {
    "year": 2019,
    "make": "Alfa Romeo",
    "model": "4C",
    "part_type": "Grille"
}

response2 = requests.post(
    'http://localhost:8000/api/hollander/lookup/',
    json=payload2,
    headers={'Content-Type': 'application/json'}
)

print(f"Status Code: {response2.status_code}")
print(f"Response: {json.dumps(response2.json(), indent=2)}\n")

# Test 3: No match scenario
print("="*70)
print("TEST 3: Invalid Data (Should return empty)")
print("="*70)

payload3 = {
    "year": 1950,
    "make": "InvalidMake",
    "model": "InvalidModel",
    "part_type": "InvalidPart"
}

response3 = requests.post(
    'http://localhost:8000/api/hollander/lookup/',
    json=payload3,
    headers={'Content-Type': 'application/json'}
)

print(f"Status Code: {response3.status_code}")
print(f"Response: {json.dumps(response3.json(), indent=2)}\n")

print("="*70)
print("✅ API TESTS COMPLETE")
print("="*70)
