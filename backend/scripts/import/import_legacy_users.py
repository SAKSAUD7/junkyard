import os
import sys
import json
import django
from django.db import transaction

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.hollander.models import LegacyAccount, LegacyUser, Association

JSON_DIR = r"c:\Users\saksa\Videos\jynm_json\jynm_json"

def safe_int(value, default=0):
    try:
        if isinstance(value, str):
            value = value.strip()
            if not value or value == 'NULL' or value == '' or value == 'null': return default
        if value is None: return default
        return int(value)
    except (ValueError, TypeError):
        return default

def safe_float(value, default=0.0):
    try:
        if isinstance(value, str):
            value = value.strip()
            if not value or value == 'NULL': return default
        if value is None: return default
        return float(value)
    except (ValueError, TypeError):
        return default

def str_to_bool(value):
    if isinstance(value, str):
        return value.lower() == 'true' or value == '1'
    return bool(value)

def get_json_data(filename):
    print(f"Reading {filename}...")
    filepath = os.path.join(JSON_DIR, filename)
    try:
        with open(filepath, 'r', encoding='utf-8-sig') as f:
            return json.load(f)
    except UnicodeDecodeError:
        with open(filepath, 'r', encoding='latin-1') as f:
            return json.load(f)

def load_associations():
    data = get_json_data("Associations.json")
    print(f"Importing {len(data)} Associations...")
    objs = []
    for item in data:
        objs.append(Association(
            association_id=safe_int(item.get('associationID')),
            name=item.get('associationName', '')[:255],
            url=item.get('associationUrl', '')[:255],
            state_code=item.get('associationState', '')[:10],
            country_code=item.get('associationCountry', '')[:10],
            is_deleted=str_to_bool(item.get('associationDeleted'))
        ))
    Association.objects.bulk_create(objs, ignore_conflicts=True)
    print("Associations Imported.")

def load_accounts():
    data = get_json_data("Accounts.json")
    print(f"Importing {len(data)} Legacy Accounts...")
    objs = []
    for item in data:
        # Skipping null IDs or truncated data 
        aid = item.get('accountID')
        if not aid or isinstance(aid, str) and (aid.startswith('\n') or '<div' in aid):
            continue 
            
        objs.append(LegacyAccount(
            account_id=safe_int(aid),
            name=item.get('accountName', '')[:255] if item.get('accountName') else '',
            profile_title=item.get('accountProfileTitle', '')[:255] if item.get('accountProfileTitle') else '',
            contact_email=item.get('accountOwnerEmail') if item.get('accountOwnerEmail') else None,
            contact_phone=item.get('accountOwnerPhone', '')[:50] if item.get('accountOwnerPhone') else '',
            address_street1=item.get('accountAddressStreet1', '')[:255] if item.get('accountAddressStreet1') else '',
            address_city=item.get('accountAddressCity', '')[:100] if item.get('accountAddressCity') else '',
            address_state=item.get('accountAddressState', '')[:50] if item.get('accountAddressState') else '',
            address_zip=item.get('accountAddressZip', '')[:20] if item.get('accountAddressZip') else '',
            address_country=item.get('accountAddressCountry', '')[:50] if item.get('accountAddressCountry') else '',
            created_at=item.get('accountCreated', '')[:50] if item.get('accountCreated') else '',
            is_active=str_to_bool(item.get('accountActive')),
            latitude=safe_float(item.get('Latitude')),
            longitude=safe_float(item.get('Longitude'))
        ))
        
        if len(objs) >= 2000:
            LegacyAccount.objects.bulk_create(objs, ignore_conflicts=True)
            objs = []

    if objs:
        LegacyAccount.objects.bulk_create(objs, ignore_conflicts=True)
    print("Legacy Accounts Imported.")

def load_users():
    data = get_json_data("Users.json")
    print(f"Importing {len(data)} Legacy Users...")
    objs = []
    for item in data:
        objs.append(LegacyUser(
            user_id=safe_int(item.get('userID')),
            email=item.get('userEmail', '')[:254],
            first_name=item.get('userFirstName', '')[:100],
            last_name=item.get('userLastName', '')[:100],
            password_hash=item.get('userPassword', '')[:255],
            password_salt=item.get('userPasswordSalt', '')[:255],
            legacy_password_plain=item.get('userPasswordOld', '')[:255],
            is_admin=str_to_bool(item.get('userAdmin', '0')),
            is_active=str_to_bool(item.get('userActive', '1')),
            created_at=item.get('userCreated', '')[:50]
        ))
        if len(objs) >= 2000:
            LegacyUser.objects.bulk_create(objs, ignore_conflicts=True)
            objs = []
            
    if objs:
        LegacyUser.objects.bulk_create(objs, ignore_conflicts=True)
    print("Legacy Users Imported.")

if __name__ == "__main__":
    load_associations()
    load_accounts()
    load_users()
    print("Phase 5 Import Complete.")
