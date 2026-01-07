import os
import sys
import json
import django
from datetime import datetime

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.hollander.models import HollanderMakeModelRef, HollanderPartRef, HollanderIndex, VehicleImage

JSON_DIR = r"c:\Users\saksa\Videos\jynm_json\jynm_json"

def safe_int(value, default=0):
    try:
        return int(value)
    except (ValueError, TypeError):
        return default

def get_json_data(filename):
    print(f"Reading {filename}...")
    filepath = os.path.join(JSON_DIR, filename)
    try:
        with open(filepath, 'r', encoding='utf-8-sig') as f:
            return json.load(f)
    except UnicodeDecodeError:
        with open(filepath, 'r', encoding='latin-1') as f:
            return json.load(f)

def load_make_model_ref():
    data = get_json_data("O_xTabMakeModelRef.json")
    print(f"Importing {len(data)} MakeModelRefs...")
    
    objs = []
    for item in data:
        ref_id = safe_int(item.get('RefID'))
        if ref_id == 0: continue # Skip invalid IDs
        
        objs.append(HollanderMakeModelRef(
            ref_id=ref_id,
            h_make_code=item.get('HMakeCode', ''),
            h_make=item.get('HMake', ''),
            h_model=item.get('HModel', ''),
            aph_make=item.get('AphMake', ''),
            aph_model=item.get('AphModel', ''),
            a_url=item.get('aUrl', ''),
            active_flag=True if item.get('ActiveFlag') == '1' else False
        ))
        if len(objs) >= 1000:
            HollanderMakeModelRef.objects.bulk_create(objs, ignore_conflicts=True)
            objs = []
            
    if objs:
        HollanderMakeModelRef.objects.bulk_create(objs, ignore_conflicts=True)
    print("MakeModelRefs Imported.")

def load_part_ref():
    data = get_json_data("O_xTabPartRef.json")
    print(f"Importing {len(data)} PartRefs...")
    
    objs = []
    for item in data:
        vpid = safe_int(item.get('VPID'))
        if vpid == 0: continue
        
        objs.append(HollanderPartRef(
            vpid=vpid,
            part_code=item.get('PartCode', ''),
            part_name=item.get('PartName', ''),
            part_url=item.get('PartUrl', ''),
            part_kw=item.get('PartKw', ''),
            active_flag=True if item.get('ActiveFlag') == '1' else False
        ))
        if len(objs) >= 1000:
            HollanderPartRef.objects.bulk_create(objs, ignore_conflicts=True)
            objs = []
            
    if objs:
        HollanderPartRef.objects.bulk_create(objs, ignore_conflicts=True)
    print("PartRefs Imported.")

def load_images():
    data = get_json_data("Images.json")
    print(f"Importing {len(data)} Images...")
    
    objs = []
    for item in data:
        try:
            created_on = None
            if item.get('imageCreatedOn') and item.get('imageCreatedOn') != '0000-00-00 00:00:00':
                try:
                    created_on = datetime.strptime(item.get('imageCreatedOn'), '%Y-%m-%d %H:%M:%S')
                except:
                    pass

            objs.append(VehicleImage(
                image_id=safe_int(item.get('imageID')),
                image_target_id=safe_int(item.get('imageTargetID')),
                image_category_id=safe_int(item.get('imageCategoryID')),
                image_file_name=item.get('imageFileName', ''),
                image_title=item.get('imageTitle', ''),
                image_created_on=created_on,
                image_deleted=True if item.get('imageDeleted') == '1' else False
            ))
        except ValueError:
            continue

        if len(objs) >= 1000:
            VehicleImage.objects.bulk_create(objs, ignore_conflicts=True)
            objs = []
            
    if objs:
        VehicleImage.objects.bulk_create(objs, ignore_conflicts=True)
    print("Images Imported.")

def load_hollander_index():
    print("Importing Hollander Index (This is large, please wait)...")
    try:
        data = get_json_data("O_IndexList.json")
    except MemoryError:
        print("Memory Error loading O_IndexList.json. Please split file or use streaming.")
        return

    print(f"Processing {len(data)} Index records...")
    
    objs = []
    count = 0
    for item in data:
        try:
            idx_id = item.get('IDXID', '')
            if not idx_id: continue
            
            objs.append(HollanderIndex(
                idx_id=idx_id,
                model_nm=item.get('ModelNm', ''),
                part_type_nbr=item.get('PartTypeNbr', ''),
                mfr_cd=item.get('MfrCd', ''),
                begin_year=safe_int(item.get('BeginYear')),
                end_year=safe_int(item.get('EndYear'))
            ))
            
            if len(objs) >= 2000:
                HollanderIndex.objects.bulk_create(objs, ignore_conflicts=True)
                count += len(objs)
                objs = []
                print(f"  Imported {count} records...", end='\r')
                
        except Exception:
            continue
            
    if objs:
        HollanderIndex.objects.bulk_create(objs, ignore_conflicts=True)
        count += len(objs)
        
    print(f"\nHollander Index Imported ({count} records).")

if __name__ == "__main__":
    load_make_model_ref()
    load_part_ref()
    load_images()
    load_hollander_index()
    print("Extended Data Import Complete.")
