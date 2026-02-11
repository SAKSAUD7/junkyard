import requests

# Test the ads API endpoint
url = 'http://localhost:8000/api/ads/'

print("=== Testing Ads API ===")

# Test 1: Get all ads
print("\n1. Get all ads:")
response = requests.get(url)
print(f"Status: {response.status_code}")
data = response.json()
print(f"Total ads: {len(data.get('results', data))}")

# Test 2: Get ads for home page, left sidebar
print("\n2. Get ads for home page, left sidebar:")
response = requests.get(url, params={'slot': 'left_sidebar_ad', 'target_page': 'home'})
print(f"Status: {response.status_code}")
data = response.json()
results = data.get('results', data)
print(f"Found {len(results)} ads")
if results:
    for ad in results:
        print(f"  - {ad.get('title')} (Page: {ad.get('page')}, Slot: {ad.get('slot')}, Active: {ad.get('is_active')})")
else:
    print("  No ads found!")

# Test 3: Get ads for home page, right sidebar
print("\n3. Get ads for home page, right sidebar:")
response = requests.get(url, params={'slot': 'right_sidebar_ad', 'target_page': 'home'})
print(f"Status: {response.status_code}")
data = response.json()
results = data.get('results', data)
print(f"Found {len(results)} ads")
if results:
    for ad in results:
        print(f"  - {ad.get('title')} (Page: {ad.get('page')}, Slot: {ad.get('slot')}, Active: {ad.get('is_active')})")
