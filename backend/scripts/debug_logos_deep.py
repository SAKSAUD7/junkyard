import os
import json
import hashlib

def investigate_logos():
    print("--- Logo Investigation ---")
    logos_dir = os.path.join('frontend', 'public', 'images', 'vendors')
    if os.path.exists(logos_dir):
        files = os.listdir(logos_dir)
        hashes = [f for f in files if len(f) > 30]
        print(f"Total Files: {len(files)}")
        print(f"Hashed Files: {len(hashes)}")
        if hashes:
            print(f"Sample Hash: {hashes[0]}")
            # Try to see if it matches a vendor name hash?
            vendor_name = "Junkyard"
            md5 = hashlib.md5(vendor_name.encode()).hexdigest()
            print(f"Test Hash (Junkyard): {md5}")
    else:
        print("Logos dir not found")

    # Check extracted vendors if possible? 
    # (Assuming we can't easily read the DB, checking what we have)
    print("\n--- Extracted Data Size ---")
    for f in os.listdir('backend'):
        if f.endswith('.jsonl'):
            size = os.path.getsize(os.path.join('backend', f))
            print(f"{f}: {size} bytes")

if __name__ == "__main__":
    investigate_logos()
