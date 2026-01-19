"""
Import Yard Relationships (Make & Part Specializations)
========================================================
Imports _yardmake.json and _yardparts.json
"""

import os
import sys
import django
import json
from pathlib import Path

# Setup Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from apps.hollander.models import Vendor, Make, PartType, YardMake, YardPart
from django.db import transaction

# Path to JSON files
JSON_DIR = Path(r"c:\Users\saksa\Videos\jynm_json\jynm_json")

def import_yard_makes():
    """Import yard-make relationships"""
    print("\n=== Importing Yard-Make Relationships ===")
    
    yardmake_file = JSON_DIR / "_yardmake.json"
    
    with open(yardmake_file, 'r', encoding='utf-8') as f:
        yardmake_data = json.load(f)
    
    print(f"Found {len(yardmake_data)} yard-make relationships")
    
    created = 0
    skipped = 0
    errors = 0
    
    # Process in batches
    batch_size = 1000
    batch = []
    
    for i, entry in enumerate(yardmake_data):
        yard_id = entry.get('YardID') or entry.get('yardId') or entry.get('yard_id')
        make_id = entry.get('MakeID') or entry.get('makeId') or entry.get('make_id')
        
        if not yard_id or not make_id:
            skipped += 1
            continue
        
        try:
            # Check if vendor and make exist
            vendor = Vendor.objects.filter(yard_id=yard_id).first()
            make = Make.objects.filter(make_id=make_id).first()
            
            if not vendor:
                skipped += 1
                continue
            
            if not make:
                skipped += 1
                continue
            
            # Create YardMake entry
            batch.append(YardMake(vendor=vendor, make=make))
            
            # Insert batch
            if len(batch) >= batch_size:
                with transaction.atomic():
                    YardMake.objects.bulk_create(batch, ignore_conflicts=True)
                created += len(batch)
                batch = []
                print(f"Progress: {created}/{len(yardmake_data)}")
        
        except Exception as e:
            errors += 1
            if errors < 10:  # Only print first 10 errors
                print(f"Error processing entry {i}: {e}")
    
    # Insert remaining batch
    if batch:
        with transaction.atomic():
            YardMake.objects.bulk_create(batch, ignore_conflicts=True)
        created += len(batch)
    
    print(f"\n[OK] Yard-Make Import Complete:")
    print(f"   Created: {created}")
    print(f"   Skipped: {skipped}")
    print(f"   Errors: {errors}")
    print(f"   Total in DB: {YardMake.objects.count()}")


def import_yard_parts():
    """Import yard-part relationships"""
    print("\n=== Importing Yard-Part Relationships ===")
    
    yardparts_file = JSON_DIR / "_yardparts.json"
    
    with open(yardparts_file, 'r', encoding='utf-8') as f:
        yardparts_data = json.load(f)
    
    print(f"Found {len(yardparts_data)} yard-part relationships")
    
    created = 0
    skipped = 0
    errors = 0
    
    # Process in batches
    batch_size = 1000
    batch = []
    
    for i, entry in enumerate(yardparts_data):
        yard_id = entry.get('YardID') or entry.get('yardId') or entry.get('yard_id')
        part_id = entry.get('PartID') or entry.get('partId') or entry.get('part_id')
        
        if not yard_id or not part_id:
            skipped += 1
            continue
        
        try:
            # Check if vendor and part exist
            vendor = Vendor.objects.filter(yard_id=yard_id).first()
            part_type = PartType.objects.filter(part_id=part_id).first()
            
            if not vendor:
                skipped += 1
                continue
            
            if not part_type:
                skipped += 1
                continue
            
            # Create YardPart entry
            batch.append(YardPart(vendor=vendor, part_type=part_type))
            
            # Insert batch
            if len(batch) >= batch_size:
                with transaction.atomic():
                    YardPart.objects.bulk_create(batch, ignore_conflicts=True)
                created += len(batch)
                batch = []
                print(f"Progress: {created}/{len(yardparts_data)}")
        
        except Exception as e:
            errors += 1
            if errors < 10:  # Only print first 10 errors
                print(f"Error processing entry {i}: {e}")
    
    # Insert remaining batch
    if batch:
        with transaction.atomic():
            YardPart.objects.bulk_create(batch, ignore_conflicts=True)
        created += len(batch)
    
    print(f"\n[OK] Yard-Part Import Complete:")
    print(f"   Created: {created}")
    print(f"   Skipped: {skipped}")
    print(f"   Errors: {errors}")
    print(f"   Total in DB: {YardPart.objects.count()}")


if __name__ == "__main__":
    print("=" * 60)
    print("YARD RELATIONSHIP DATA IMPORT")
    print("=" * 60)
    
    try:
        # Import relationships
        import_yard_makes()
        import_yard_parts()
        
        print("\n" + "=" * 60)
        print("[OK] ALL RELATIONSHIP IMPORTS COMPLETE")
        print("=" * 60)
        print(f"\nFinal Stats:")
        print(f"  Vendors in DB: {Vendor.objects.count()}")
        print(f"  Yard-Make Relationships: {YardMake.objects.count()}")
        print(f"  Yard-Part Relationships: {YardPart.objects.count()}")
        
    except Exception as e:
        print(f"\n[ERROR] Error during import: {e}")
        import traceback
        traceback.print_exc()
