import requests
import json

# Test the Hollander lookup endpoint
url = 'http://localhost:8000/api/hollander/lookup/'

# Test data - Acura Integra 2024 Bumper Reinforcement - Front
test_payload = {
    'year': 2024,
    'make_id': 1,  # Acura
    'model_id': 1,  # Integra  
    'part_id': 1   # Bumper Reinforcement - Front
}

print("Testing Hollander Lookup Endpoint...")
print(f"URL: {url}")
print(f"Payload: {json.dumps(test_payload, indent=2)}")
print("\nSending request...")

try:
    response = requests.post(url, json=test_payload)
    print(f"\nStatus Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"Error: {e}")
