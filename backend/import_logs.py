import os
import sys
import json
import django
from django.db import transaction
from datetime import datetime

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.hollander.models import ProfileVisit

JSON_FILE = r"c:\Users\saksa\Videos\jynm_json\jynm_json\ProfileVisits.json"

def safe_int(value, default=0):
    try:
        return int(value)
    except (ValueError, TypeError):
        return default

def load_logs():
    print(f"Reading {JSON_FILE}...")
    
    if not os.path.exists(JSON_FILE):
        print("File not found.")
        return

    count = 0
    objs = []
    
    # Efficient line-by-line reading
    with open(JSON_FILE, 'r', encoding='utf-8-sig', errors='replace') as f:
        for line in f:
            line = line.strip()
            if not line: continue
            if line == '[' or line == ']': continue
            
            # Remove trailing comma if present logic
            if line.endswith(','):
                line = line[:-1]
                
            try:
                data = json.loads(line)
                
                # Extract fields
                # "trackingCreatedOn": "2013-12-22 15:11:36"
                created_str = data.get('trackingCreatedOn', '')
                created_dt = None
                if created_str:
                    try:
                        created_dt = datetime.strptime(created_str, "%Y-%m-%d %H:%M:%S")
                    except ValueError:
                        pass # Keep None

                objs.append(ProfileVisit(
                    tracking_id=safe_int(data.get('trackingID')),
                    account_id=safe_int(data.get('accountID')),
                    created_on=created_dt
                ))
                
                count += 1
                if len(objs) >= 5000:
                    ProfileVisit.objects.bulk_create(objs, ignore_conflicts=True)
                    objs = []
                    print(f"Imported {count} logs...", end='\r')
                    
            except json.JSONDecodeError:
                # Skip malformed lines
                continue
            except Exception as e:
                print(f"Error skipping line: {e}")
                continue

    if objs:
        ProfileVisit.objects.bulk_create(objs, ignore_conflicts=True)
    
    print(f"\nProfile Visits Import Complete. Total: {count}")

if __name__ == "__main__":
    load_logs()
