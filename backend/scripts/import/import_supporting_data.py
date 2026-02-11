import os
import sys
import json
import django
from django.db import transaction

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.hollander.models import State, Zipcode, Vendor, VendorDetail, VendorHours, VendorRating

JSON_DIR = r"c:\Users\saksa\Videos\jynm_json\jynm_json"

def safe_int(value, default=0):
    try:
        if isinstance(value, str):
            value = value.strip()
            if not value or value == 'NULL': return default
        return int(value)
    except (ValueError, TypeError):
        return default

def safe_float(value, default=0.0):
    try:
        if isinstance(value, str):
            value = value.strip()
            if not value or value == 'NULL': return default
        return float(value)
    except (ValueError, TypeError):
        return default

def str_to_bool(value):
    if isinstance(value, str):
        return value.lower() == 'true'
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

def load_states():
    data = get_json_data("_state.json")
    print(f"Importing {len(data)} States...")
    objs = []
    for item in data:
        objs.append(State(
            state_code=item.get('StateCode', '')[:5],
            name=item.get('Name', ''),
            country_id=safe_int(item.get('CountryID'))
        ))
    State.objects.bulk_create(objs, ignore_conflicts=True)
    print("States Imported.")

def load_zipcodes():
    print("Importing Zipcodes (Large file)...")
    try:
        data = get_json_data("Zipcodes.json")
    except MemoryError:
        print("Memory Error loading Zipcodes.json.")
        return

    print(f"Processing {len(data)} Zipcodes...")
    objs = []
    for item in data:
        objs.append(Zipcode(
            zipcode_id=safe_int(item.get('ZipcodeID')),
            postal_code=item.get('PostalCode', ''),
            city_name=item.get('CityName', ''),
            state_abbr=item.get('ProvinceAbbr', ''),
            county_name=item.get('CountyName', ''),
            latitude=safe_float(item.get('Latitude')),
            longitude=safe_float(item.get('Longitude'))
        ))
        if len(objs) >= 5000:
            Zipcode.objects.bulk_create(objs, ignore_conflicts=True)
            objs = []
    
    if objs:
        Zipcode.objects.bulk_create(objs, ignore_conflicts=True)
    print("Zipcodes Imported.")

def load_vendor_details():
    data = get_json_data("_yarddetails.json")
    print(f"Importing {len(data)} Vendor Details...")
    
    # Prerequisite: Vendor must exist. We filter by existing yards.
    existing_yard_ids = set(Vendor.objects.values_list('yard_id', flat=True))
    
    objs = []
    for item in data:
        yard_id = safe_int(item.get('YardID'))
        if yard_id not in existing_yard_ids: continue
        
        objs.append(VendorDetail(
            vendor_id=yard_id,
            payment_visa=str_to_bool(item.get('PaymentVisa')),
            payment_mastercard=str_to_bool(item.get('PaymentMastercard')),
            payment_amex=str_to_bool(item.get('PaymentAmericanExpress')),
            payment_discover=str_to_bool(item.get('PaymentDiscover')),
            payment_check=str_to_bool(item.get('PaymentPersonalChecks')),
            in_business_since=safe_int(item.get('InBusinessSince')),
            warranty_num=safe_int(item.get('WarrantyNum')),
            warranty_type=safe_int(item.get('WarrantyType'))
        ))
        if len(objs) >= 1000:
            VendorDetail.objects.bulk_create(objs, ignore_conflicts=True)
            objs = []
            
    if objs:
        VendorDetail.objects.bulk_create(objs, ignore_conflicts=True)
    print("Vendor Details Imported.")

def load_vendor_hours():
    data = get_json_data("_openclosetime.json")
    print(f"Importing {len(data)} Vendor Hours...")
    
    existing_yard_ids = set(Vendor.objects.values_list('yard_id', flat=True))
    
    objs = []
    for item in data:
        yard_id = safe_int(item.get('YardID'))
        if yard_id not in existing_yard_ids: continue
        
        objs.append(VendorHours(
            vendor_id=yard_id,
            weekday_id=safe_int(item.get('WeekDayID')),
            open_time=item.get('OpenTime', ''),
            close_time=item.get('CloseTime', '')
        ))
        if len(objs) >= 1000:
            VendorHours.objects.bulk_create(objs, ignore_conflicts=True)
            objs = []
            
    if objs:
        VendorHours.objects.bulk_create(objs, ignore_conflicts=True)
    print("Vendor Hours Imported.")


def load_vendor_ratings():
    data = get_json_data("_rate.json")
    print(f"Importing {len(data)} Vendor Ratings...")
    
    existing_yard_ids = set(Vendor.objects.values_list('yard_id', flat=True))
    
    objs = []
    for item in data:
        yard_id = safe_int(item.get('YardID'))
        if yard_id not in existing_yard_ids: continue
        
        objs.append(VendorRating(
            rate_id=safe_int(item.get('RateID')),
            vendor_id=yard_id,
            service_score=safe_int(item.get('Service')),
            quality_score=safe_int(item.get('Quality')),
            price_score=safe_int(item.get('Price')),
            comment=item.get('Comment', '')[:5000], # Truce heavy text
            first_name=item.get('FirstName', ''),
            last_name=item.get('LastName', ''),
            zip_code=item.get('ZipCode', ''),
            date_posted=item.get('Date', '')
        ))
        if len(objs) >= 1000:
            VendorRating.objects.bulk_create(objs, ignore_conflicts=True)
            objs = []
            
    if objs:
        VendorRating.objects.bulk_create(objs, ignore_conflicts=True)
    print("Vendor Ratings Imported.")

if __name__ == "__main__":
    load_states()
    load_zipcodes()
    load_vendor_details()
    load_vendor_hours()
    load_vendor_ratings()
    print("Supporting Data Import Complete.")
