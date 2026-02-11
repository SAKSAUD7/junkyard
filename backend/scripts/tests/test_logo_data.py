import json
import os

# Load _yard.json
yard_json = r"c:\Users\saksa\Videos\jynm_json\jynm_json\_yard.json"
with open(yard_json, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Count yards with logos
yards_with_logos = [y for y in data if y.get('Logo') and y['Logo'] != 'NULL' and y['Logo'].strip()]
print(f"Total yards in JSON: {len(data)}")
print(f"Yards with logos: {len(yards_with_logos)}")

# Show first 5 examples
print("\nFirst 5 yards with logos:")
for yard in yards_with_logos[:5]:
    print(f"  YardID: {yard['YardID']}, Name: {yard['Name'][:30]}, Logo: {yard['Logo']}")

# Check if logo files exist
logo_dir = r"c:\Users\saksa\OneDrive\Desktop\jynm\httpdocs00\static\uploads\account-logo"
print(f"\nChecking if logo directory exists: {os.path.exists(logo_dir)}")

if os.path.exists(logo_dir):
    # Check first logo file
    first_logo = yards_with_logos[0]['Logo']
    logo_path = os.path.join(logo_dir, first_logo)
    print(f"First logo file: {first_logo}")
    print(f"File exists: {os.path.exists(logo_path)}")
