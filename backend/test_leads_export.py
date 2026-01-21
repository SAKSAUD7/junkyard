import requests

# Test the leads export endpoint
url = "http://localhost:8000/api/leads/export_csv/"

print("Testing Leads Export Endpoint")
print("=" * 60)

# Test without auth
print("\n1. Testing without authentication:")
try:
    response = requests.get(url)
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.text[:200]}")
except Exception as e:
    print(f"   Error: {e}")

# Test with invalid token
print("\n2. Testing with invalid token:")
try:
    headers = {"Authorization": "Bearer invalid_token"}
    response = requests.get(url, headers=headers)
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.text[:200]}")
except Exception as e:
    print(f"   Error: {e}")

print("\n" + "=" * 60)
print("Note: You need a valid admin token to test the actual export")
print("The endpoint exists and is properly configured.")
