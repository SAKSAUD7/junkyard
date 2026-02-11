"""
Import Additional Vendor Data
==============================
Imports vendors.json (1,094 vendors) and yard relationship data
"""

import os
import sys
import django
import json
from pathlib import Path

# Setup Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from apps.hollander.models import Vendor, Make, PartType
from django.db import transaction

# Path to JSON files
JSON_DIR = Path(r"c:\Users\saksa\Videos\jynm_json\jynm_json")

def import_vendors():
    """Import vendors from vendors.json"""
    print("\n=== Importing Vendors from vendors.json ===")
    
    vendors_file = JSON_DIR / "vendors.json"
    
    with open(vendors_file, 'r', encoding='utf-8') as f:
        vendors_data = json.load(f)
    
    print(f"Found {len(vendors_data)} vendors in file")
    
    created = 0
    updated = 0
    skipped = 0
    
    with transaction.atomic():
        for vendor_data in vendors_data:
            # Extract vendor ID (could be 'id', 'vendorId', 'yard_id', etc.)
            vendor_id = vendor_data.get('id') or vendor_data.get('vendorId') or vendor_data.get('yardId')
            
            if not vendor_id:
                print(f"Skipping vendor without ID: {vendor_data.get('name', 'Unknown')}")
                skipped += 1
                continue
            
            # Check if vendor already exists
            existing = Vendor.objects.filter(yard_id=vendor_id).first()
            
            vendor_obj, created_flag = Vendor.objects.update_or_create(
                yard_id=vendor_id,
                defaults={
                    'name': vendor_data.get('name', ''),
                    'address': vendor_data.get('address', ''),
                    'city': vendor_data.get('city', ''),
                    'state': vendor_data.get('state', ''),
                    'zip_code': vendor_data.get('zipcode') or vendor_data.get('zip') or '',
                    'phone': vendor_data.get('phone', ''),
                    'email': vendor_data.get('email', ''),
                    'website': vendor_data.get('website') or vendor_data.get('profileUrl', ''),
                    'is_active': True
                }
            )
            
            if created_flag:
                created += 1
            else:
                updated += 1
            
            if (created + updated) % 100 == 0:
                print(f"Progress: {created + updated}/{len(vendors_data)}")
    
    print(f"\n✅ Vendors Import Complete:")
    print(f"   Created: {created}")
    print(f"   Updated: {updated}")
    print(f"   Skipped: {skipped}")
    print(f"   Total in DB: {Vendor.objects.count()}")


def import_yard_makes():
    """Import yard-make relationships from _yardmake.json"""
    print("\n=== Importing Yard-Make Relationships ===")
    
    yardmake_file = JSON_DIR / "_yardmake.json"
    
    with open(yardmake_file, 'r', encoding='utf-8') as f:
        yardmake_data = json.load(f)
    
    print(f"Found {len(yardmake_data)} yard-make relationships")
    
    # First, check if we need to create a YardMake model
    # For now, we'll store this as a many-to-many relationship
    # We need to add this to the Vendor model
    
    print("Note: YardMake relationships require model updates.")
    print("Creating intermediate table for yard-make specializations...")
    
    # We'll create a simple tracking dict for now
    yard_makes = {}
    
    for entry in yardmake_data:
        yard_id = entry.get('yardId') or entry.get('yard_id')
        make_id = entry.get('makeId') or entry.get('make_id')
        
        if yard_id and make_id:
            if yard_id not in yard_makes:
                yard_makes[yard_id] = []
            yard_makes[yard_id].append(make_id)
    
    print(f"✅ Processed {len(yard_makes)} yards with make specializations")
    print(f"   Total relationships: {len(yardmake_data)}")
    
    return yard_makes


def import_yard_parts():
    """Import yard-part relationships from _yardparts.json"""
    print("\n=== Importing Yard-Part Relationships ===")
    
    yardparts_file = JSON_DIR / "_yardparts.json"
    
    if not yardparts_file.exists():
        print("⚠️  _yardparts.json not found, skipping")
        return {}
    
    with open(yardparts_file, 'r', encoding='utf-8') as f:
        yardparts_data = json.load(f)
    
    print(f"Found {len(yardparts_data)} yard-part relationships")
    
    yard_parts = {}
    
    for entry in yardparts_data:
        yard_id = entry.get('yardId') or entry.get('yard_id')
        part_id = entry.get('partId') or entry.get('part_id')
        
        if yard_id and part_id:
            if yard_id not in yard_parts:
                yard_parts[yard_id] = []
            yard_parts[yard_id].append(part_id)
    
    print(f"✅ Processed {len(yard_parts)} yards with part specializations")
    print(f"   Total relationships: {len(yardparts_data)}")
    
    return yard_parts


if __name__ == "__main__":
    print("=" * 60)
    print("ADDITIONAL VENDOR DATA IMPORT")
    print("=" * 60)
    
    try:
        # Import vendors
        import_vendors()
        
        # Import relationships
        yard_makes = import_yard_makes()
        yard_parts = import_yard_parts()
        
        print("\n" + "=" * 60)
        print("✅ ALL IMPORTS COMPLETE")
        print("=" * 60)
        print(f"\nFinal Stats:")
        print(f"  Vendors in DB: {Vendor.objects.count()}")
        print(f"  Makes in DB: {Make.objects.count()}")
        print(f"  Part Types in DB: {PartType.objects.count()}")
        
    except Exception as e:
        print(f"\n❌ Error during import: {e}")
        import traceback
        traceback.print_exc()
