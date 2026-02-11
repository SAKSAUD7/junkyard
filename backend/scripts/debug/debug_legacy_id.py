import json
import os

files = [
    r'c:\Users\saksa\Videos\jynm_json\jynm_json\Accounts.json',
    r'c:\Users\saksa\Videos\jynm_json\jynm_json\vendors.json',
    r'c:\Users\saksa\Videos\jynm_json\jynm_json\_yard.json'
]

target_id = 1112188
target_str = str(target_id)

def scan_file(path):
    if not os.path.exists(path):
        print(f"Skipping {path} (not found)")
        return

    print(f"\nScanning {path}...")
    try:
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        if isinstance(data, list):
            print(f"File contains list of {len(data)} items.")
            found = False
            for item in data:
                # Check all values
                values = str(item.values())
                if target_str in values:
                    print(f"✅ FOUND {target_id} in item!")
                    print(json.dumps(item, indent=2))
                    found = True
                    break
            if not found:
                print(f"❌ ID {target_id} not found in any item values.")
                
        elif isinstance(data, dict):
             print(f"File contains dict keys: {list(data.keys())[:5]}...")
        
    except Exception as e:
        print(f"Error scanning {path}: {e}")

if __name__ == "__main__":
    for f in files:
        scan_file(f)
