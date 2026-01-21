import requests
import json

# Test the API with large page_size
response = requests.get('http://localhost:8000/api/vendors/?page_size=10000')
data = response.json()

vendors = data.get('results', [])
total = len(vendors)

# Count by state
from collections import Counter
state_counts = Counter(v['state'] for v in vendors)

print(f"Total vendors returned: {total}")
print(f"\nTop 10 states by vendor count:")
for state, count in state_counts.most_common(10):
    print(f"  {state}: {count} vendors")

print(f"\nCA vendors: {state_counts.get('CA', 0)}")
print(f"FL vendors: {state_counts.get('FL', 0)}")
print(f"TX vendors: {state_counts.get('TX', 0)}")
