import hashlib
import json
import os
from pathlib import Path

# Path to logo directory
LOGO_DIR = Path(r"c:\Users\saksa\Downloads\Telegram Desktop\ALL_IMAGES\ALL_IMAGES\account-logo")
# Path to vendors JSON
VENDORS_JSON = Path(r"c:\Users\saksa\Videos\jynm_json\jynm_json\vendors_extracted\vendors_part_1.json")


def get_hashes(s):
    s_str = str(s).encode('utf-8')
    return [
        hashlib.sha1(s_str).hexdigest(),
        hashlib.md5(s_str).hexdigest(),
        hashlib.sha256(s_str).hexdigest()
    ]

def check_hashes():
    if not LOGO_DIR.exists():
        print(f"Directory not found: {LOGO_DIR}")
        return

    print("Loading logo filenames...")
    logo_hashes = {f.stem.lower() for f in LOGO_DIR.glob('*')}
    print(f"Found {len(logo_hashes)} logo files.")

    print("Loading vendors...")
    vendors = []
    with open(VENDORS_JSON, 'r') as f:
        for i, line in enumerate(f):
            if not line.strip(): continue
            try:
                vendors.append(json.loads(line))
            except json.JSONDecodeError:
                # print(f"Skipping malformed line {i+1}")
                pass
    
    print(f"Loaded {len(vendors)} vendors. Testing hashes...")

    matches = 0
    for v in vendors:
        candidates = [
            str(v.get('accountID', '')),
            v.get('accountName', ''),
            v.get('accountName', '').lower(),
            v.get('email', '')
        ]
        
        for cand in candidates:
            if not cand: continue
            hashes = get_hashes(cand)
            for h in hashes:
                if h in logo_hashes:
                    print(f"MATCH FOUND! Vendor: {v['accountName']} (ID: {v['accountID']})")
                    print(f"  Input: '{cand}' -> Hash: {h}")
                    matches += 1
                    if matches >= 5: return

    if matches == 0:
        print("No matches found using standard fields (SHA1/MD5/SHA256).")

if __name__ == "__main__":
    check_hashes()
