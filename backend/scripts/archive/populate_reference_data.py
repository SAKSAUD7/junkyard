import os
import sys
import json
import django

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.hollander.models import Make, Model, PartType, Vendor

JSON_DIR = r"c:\Users\saksa\Videos\jynm_json\jynm_json"

def load_makes():
    print("Loading Makes...")
    try:
        with open(os.path.join(JSON_DIR, "MakeItems.json"), 'r', encoding='utf-8-sig') as f:
            data = json.load(f)
    except UnicodeDecodeError:
        with open(os.path.join(JSON_DIR, "MakeItems.json"), 'r', encoding='latin-1') as f:
            data = json.load(f)
    
    count = 0
    for item in data:
        Make.objects.update_or_create(
            make_id=int(item['makeID']),
            defaults={'make_name': item['makeName']}
        )
        count += 1
    print(f"Loaded {count} Makes.")

def load_models():
    print("Loading Models...")
    try:
        with open(os.path.join(JSON_DIR, "ModelItems.json"), 'r', encoding='utf-8-sig') as f:
            data = json.load(f)
    except UnicodeDecodeError:
        with open(os.path.join(JSON_DIR, "ModelItems.json"), 'r', encoding='latin-1') as f:
            data = json.load(f)
    
    count = 0
    skipped = 0
    for item in data:
        try:
            make = Make.objects.get(make_id=int(item['makeID']))
            Model.objects.update_or_create(
                model_id=int(item['modelID']),
                defaults={
                    'make': make,
                    'model_name': item['modelName']
                }
            )
            count += 1
        except Make.DoesNotExist:
            # print(f"Skipping model {item['modelName']} - MakeID {item['makeID']} not found")
            skipped += 1
    print(f"Loaded {count} Models (Skipped {skipped}).")

def load_part_types():
    print("Loading Part Types...")
    try:
        with open(os.path.join(JSON_DIR, "PartItems.json"), 'r', encoding='utf-8-sig') as f:
            data = json.load(f)
    except UnicodeDecodeError:
         with open(os.path.join(JSON_DIR, "PartItems.json"), 'r', encoding='latin-1') as f:
            data = json.load(f)
    
    count = 0
    for item in data:
        PartType.objects.update_or_create(
            part_id=int(item['partID']),
            defaults={'part_name': item['partName']}
        )
        count += 1
    print(f"Loaded {count} Part Types.")

def load_vendors():
    print("Loading Vendors (Yards)...")
    try:
        with open(os.path.join(JSON_DIR, "_yard.json"), 'r', encoding='utf-8-sig') as f:
            data = json.load(f)
    except UnicodeDecodeError:
        with open(os.path.join(JSON_DIR, "_yard.json"), 'r', encoding='latin-1') as f:
            data = json.load(f)
    
    count = 0
    for item in data:
        try:
            # Handle potentially null fields
            address = item.get('Address1', '') or ''
            if item.get('Address2') and item.get('Address2') != 'NULL':
                address += f" {item.get('Address2')}"
            
            Vendor.objects.update_or_create(
                yard_id=int(item['YardID']),
                defaults={
                    'name': item.get('Name', ''),
                    'address': address,
                    'city': item.get('City', '') or '',
                    'state': item.get('StateCode', '') or '',
                    'zip_code': item.get('Zip', '') or '',
                    'phone': item.get('ContactPhone', '') or '',
                    'email': item.get('Email', '') or '',
                    'website': item.get('WWW', '') or '',
                    'is_active': True if item.get('IsActive') == '0' else False # Check logic: usually -1 is active in legacy? Or 0?
                    # In _yard.json sample: IsActive "-1" seems common. Let's assume non-zero or just store as is. 
                    # Re-reading: sample has "IsActive": "-1" or "0". 0 usually means false, -1 true in some SQL.
                    # I'll check sample.
                }
            )
            count += 1
        except Exception as e:
            print(f"Error loading vendor {item.get('YardID')}: {e}")
            
    print(f"Loaded {count} Vendors.")

if __name__ == "__main__":
    load_makes()
    load_models()
    load_part_types()
    load_vendors()
    print("Reference Data Population Complete.")
