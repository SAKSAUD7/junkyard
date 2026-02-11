import os
import sys
import json
import django
from django.db import transaction

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.hollander.models import (
    Country,
    PresetMake, PresetMakeItem,
    PresetModel, PresetModelItem,
    PresetPart, PresetPartItem,
    PresetLocation, PresetLocationItem,
    PresetVehicle, PresetVehicleItem
)

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

def get_json_data(filename):
    print(f"Reading {filename}...")
    filepath = os.path.join(JSON_DIR, filename)
    try:
        with open(filepath, 'r', encoding='utf-8-sig') as f:
            return json.load(f)
    except UnicodeDecodeError:
        with open(filepath, 'r', encoding='latin-1') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Warning: {filename} not found.")
        return []

def load_countries():
    data = get_json_data("_country.json")
    print(f"Importing {len(data)} Countries...")
    objs = []
    for item in data:
        objs.append(Country(
            country_id=safe_int(item.get('CountryID')),
            name=item.get('Name', '')[:100]
        ))
    Country.objects.bulk_create(objs, ignore_conflicts=True)
    print("Countries Imported.")

def load_preset_makes():
    # 1. Groups
    data = get_json_data("_presetmake.json")
    print(f"Importing {len(data)} Preset Makes...")
    for item in data:
        PresetMake.objects.get_or_create(
            preset_id=safe_int(item.get('PresetMakeID')),
            defaults={'name': item.get('Name', '')}
        )
    
    # 2. Items
    data_items = get_json_data("_presetmakemakes.json")
    print(f"Importing {len(data_items)} Preset Make Items...")
    objs = []
    
    # Cache parents to avoid N+1 queries
    parents = {p.preset_id: p for p in PresetMake.objects.all()}
    
    for item in data_items:
        pid = safe_int(item.get('PresetMakeID'))
        mid = safe_int(item.get('MakeID'))
        
        parent = parents.get(pid)
        if parent:
            objs.append(PresetMakeItem(preset=parent, make_id=mid))
    
    PresetMakeItem.objects.bulk_create(objs, ignore_conflicts=True)
    print("Preset Make Items Imported.")

def load_preset_models():
    data = get_json_data("_presetmodel.json")
    if not data: return

    for item in data:
        PresetModel.objects.get_or_create(
            preset_id=safe_int(item.get('PresetModelID')),
            defaults={'name': item.get('Name', '')}
        )
    
    data_items = get_json_data("_presetmodelmodels.json")
    if not data_items: data_items = get_json_data("_presetmodels.json")
    
    objs = []
    parents = {p.preset_id: p for p in PresetModel.objects.all()}
    
    if data_items:
        for item in data_items:
            pid = safe_int(item.get('PresetModelID'))
            mid = safe_int(item.get('ModelID'))
            parent = parents.get(pid)
            if parent:
                objs.append(PresetModelItem(preset=parent, model_id=mid))
        PresetModelItem.objects.bulk_create(objs, ignore_conflicts=True)
    print("Preset Model Items Imported.")

def load_preset_parts():
    data = get_json_data("_presetpart.json")
    for item in data:
        PresetPart.objects.get_or_create(
            preset_id=safe_int(item.get('PresetPartID')),
            defaults={'name': item.get('Name', '')}
        )
    
    data_items = get_json_data("_presetpartparts.json")
    objs = []
    parents = {p.preset_id: p for p in PresetPart.objects.all()}
    
    for item in data_items:
        pid = safe_int(item.get('PresetPartID'))
        iid = safe_int(item.get('PartID'))
        parent = parents.get(pid)
        if parent:
            objs.append(PresetPartItem(preset=parent, part_id=iid))
    PresetPartItem.objects.bulk_create(objs, ignore_conflicts=True)
    print("Preset Part Items Imported.")

def load_preset_vehicles():
    data = get_json_data("_presetvehicle.json")
    for item in data:
        PresetVehicle.objects.get_or_create(
            preset_id=safe_int(item.get('PresetVehicleID')),
            defaults={'name': item.get('Name', '')}
        )
    
    data_items = get_json_data("_presetvehiclevehicles.json")
    objs = []
    parents = {p.preset_id: p for p in PresetVehicle.objects.all()}
    
    for item in data_items:
        pid = safe_int(item.get('PresetVehicleID'))
        vid = safe_int(item.get('VehicleTypeID'))
        if not vid: vid = safe_int(item.get('VehicleID'))
        parent = parents.get(pid)
        if parent:
            objs.append(PresetVehicleItem(preset=parent, vehicle_id=vid))
    PresetVehicleItem.objects.bulk_create(objs, ignore_conflicts=True)
    print("Preset Vehicle Items Imported.")

def load_preset_locations():
    data = get_json_data("_presetlocation.json")
    for item in data:
        PresetLocation.objects.get_or_create(
            preset_id=safe_int(item.get('PresetLocationID')),
            defaults={'name': item.get('Name', '')}
        )
    
    data_items = get_json_data("_presetlocationlocations.json")
    objs = []
    parents = {p.preset_id: p for p in PresetLocation.objects.all()}
    
    for item in data_items:
        pid = safe_int(item.get('PresetLocationID'))
        lid = safe_int(item.get('LocationID'))
        parent = parents.get(pid)
        if parent:
            objs.append(PresetLocationItem(preset=parent, location_id=lid))
    PresetLocationItem.objects.bulk_create(objs, ignore_conflicts=True)
    print("Preset Location Items Imported.")


if __name__ == "__main__":
    load_countries()
    load_preset_makes()
    load_preset_models()
    load_preset_parts()
    load_preset_vehicles()
    load_preset_locations()
    print("Phase 6 Import Complete.")
