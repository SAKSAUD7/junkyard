import requests
import sys
import os
import gzip
import shutil
import io

# Fix encoding for Windows console
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# Configuration
API_URL = "https://junkyard-api-dev.azurewebsites.net/api/common/migrate-lead-data/"
# Matches the hardcoded secret in the view
MIGRATION_SECRET = "temp-migration-key-2024"
DB_PATH = "backend/db.sqlite3"

def upload_and_migrate():
    if not os.path.exists(DB_PATH):
        print(f"Error: Database file not found at {DB_PATH}")
        return

    print(f"Compressing {DB_PATH}...")
    gz_path = DB_PATH + ".gz"
    with open(DB_PATH, 'rb') as f_in:
        with gzip.open(gz_path, 'wb') as f_out:
            shutil.copyfileobj(f_in, f_out)
    
    print(f"Uploading {gz_path} to {API_URL}...")
    
    headers = {
        'X-Migration-Secret': MIGRATION_SECRET
    }
    
    try:
        with open(gz_path, 'rb') as f:
            files = {'file': f}
            response = requests.post(API_URL, files=files, headers=headers, timeout=600)
            
        if response.status_code == 200:
            print("✅ Migration Successful!")
            print("Response:", response.json())
            
            # Verify Zipcode lookup
            print("\nVerifying Lead Form Data via API...")
            verify_url = "https://junkyard-api-dev.azurewebsites.net/api/hollander/zipcode/lookup/?zip=90210"
            try:
                v_res = requests.get(verify_url, timeout=30)
                if v_res.status_code == 200 and v_res.json().get('found'):
                    print("✅ Zipcode Lookup: SUCCESS (Found 90210)")
                else:
                    print(f"⚠️ Zipcode Lookup: FAILED/MISSING (Status {v_res.status_code})")
                    print("Response:", v_res.text)
            except Exception as e:
                print(f"⚠️ Verification Error: {e}")
                
        else:
            print(f"❌ Migration Failed (Status {response.status_code})")
            print("Response:", response.text)
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if os.path.exists(gz_path):
            os.remove(gz_path)

if __name__ == "__main__":
    upload_and_migrate()
