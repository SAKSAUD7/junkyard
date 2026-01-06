"""
Hollander Data Import Script
=============================
Imports 18M+ Hollander interchange records and 577K pricing records
from JSON files into the Django database.

Data Sources:
- O_IndexList.json: 18M+ interchange records (365 MB)
- tabqappartprice_final.json: 577K pricing records with options (437 MB)
- O_xTabPartRef.json: Part type reference
- O_XTabMakeModelRef.json: Make/Model reference
"""

import os
import json
import django
from datetime import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.hollander.models import HollanderInterchange, PartPricing, PartSpecification
from django.db import transaction

# File paths
BASE_DIR = r"c:\Users\saksa\Videos\jynm_json\jynm_json"
INTERCHANGE_FILE = os.path.join(BASE_DIR, "O_IndexList.json")  # 18M+ records
PRICING_FILE = os.path.join(BASE_DIR, "tabqappartprice_final.json")
PART_REF_FILE = os.path.join(BASE_DIR, "O_xTabPartRef.json")
MAKE_MODEL_REF_FILE = os.path.join(BASE_DIR, "O_XTabMakeModelRef.json")

# Batch size for bulk inserts
BATCH_SIZE = 1000

def load_reference_data():
    """Load reference data for part types and make/model mappings"""
    print("\n" + "="*80)
    print("LOADING REFERENCE DATA")
    print("="*80)
    
    # Load part type reference
    part_types = {}
    with open(PART_REF_FILE, 'r', encoding='utf-8') as f:
        part_ref_data = json.load(f)
        for item in part_ref_data:
            part_types[item['PartCode']] = item['PartName']
    print(f"✓ Loaded {len(part_types)} part types")
    
    # Load make/model reference
    make_model_map = {}
    with open(MAKE_MODEL_REF_FILE, 'r', encoding='utf-8') as f:
        make_model_data = json.load(f)
        for item in make_model_data:
            key = f"{item['MfrCd']}_{item['HModel']}"
            make_model_map[key] = {
                'make': item['AphMake'],
                'model': item['AphModel']
            }
    print(f"✓ Loaded {len(make_model_map)} make/model mappings")
    
    return part_types, make_model_map


def import_pricing_data(part_types):
    """Import pricing data with options from tabqappartprice_final.json"""
    print("\n" + "="*80)
    print("IMPORTING PRICING DATA (577K records)")
    print("="*80)
    
    batch = []
    count = 0
    created_count = 0
    
    with open(PRICING_FILE, 'r', encoding='utf-8') as f:
        pricing_data = json.load(f)
        
        for item in pricing_data:
            # Combine all NewOption fields into a single options string
            options_list = []
            for i in range(1, 12):  # NewOption1 through NewOption11
                option_key = f"NewOption{i}"
                if item.get(option_key) and item[option_key].strip():
                    options_list.append(item[option_key].strip())
            
            options_str = ", ".join(options_list) if options_list else ""
            
            # Create PartPricing record
            pricing = PartPricing(
                hollander_number=item['Hollander'],
                part_type=item.get('Part_Name', ''),
                price_low=None,  # Not in this dataset
                price_high=None,  # Not in this dataset
                price_average=None,  # Not in this dataset
                condition=''
            )
            batch.append(pricing)
            
            # Create PartSpecification records for each option
            # We'll do this separately after pricing import
            
            count += 1
            
            # Bulk insert every BATCH_SIZE records
            if len(batch) >= BATCH_SIZE:
                PartPricing.objects.bulk_create(batch, ignore_conflicts=True)
                created_count += len(batch)
                print(f"  Imported {created_count:,} pricing records...")
                batch = []
        
        # Insert remaining records
        if batch:
            PartPricing.objects.bulk_create(batch, ignore_conflicts=True)
            created_count += len(batch)
    
    print(f"\n✓ PRICING IMPORT COMPLETE")
    print(f"  Total processed: {count:,}")
    print(f"  Total created: {created_count:,}")
    
    return count


def import_interchange_data(part_types, make_model_map):
    """Import Hollander interchange data from O_IndexList.json"""
    print("\n" + "="*80)
    print("IMPORTING HOLLANDER INTERCHANGE DATA (18M+ records)")
    print("="*80)
    print("This will take 30-45 minutes...")
    
    batch = []
    count = 0
    created_count = 0
    start_time = datetime.now()
    
    with open(INTERCHANGE_FILE, 'r', encoding='utf-8') as f:
        interchange_data = json.load(f)
        
        for item in interchange_data:
            # Get part type name
            part_type_code = item.get('PartTypeNbr', '')
            part_type_name = part_types.get(part_type_code, f"Part-{part_type_code}")
            
            # Get make/model
            make_code = item.get('MfrCd', '')
            model_name = item.get('ModelNm', '')
            key = f"{make_code}_{model_name}"
            
            if key in make_model_map:
                make = make_model_map[key]['make']
                model = make_model_map[key]['model']
            else:
                # Fallback to raw values if not in mapping
                make = make_code
                model = model_name
            
            # Create HollanderInterchange record
            record = HollanderInterchange(
                hollander_number=item.get('IDXID', ''),
                year_start=int(item.get('BeginYear', 0)),
                year_end=int(item.get('EndYear', 0)),
                make=make,
                model=model,
                part_type=part_type_name,
                part_name=part_type_name,
                options='',  # Will be populated from pricing data
                notes=''
            )
            batch.append(record)
            count += 1
            
            # Bulk insert every BATCH_SIZE records
            if len(batch) >= BATCH_SIZE:
                HollanderInterchange.objects.bulk_create(batch, ignore_conflicts=True)
                created_count += len(batch)
                
                # Progress update every 10,000 records
                if created_count % 10000 == 0:
                    elapsed = (datetime.now() - start_time).total_seconds()
                    rate = created_count / elapsed if elapsed > 0 else 0
                    remaining = (len(interchange_data) - created_count) / rate if rate > 0 else 0
                    print(f"  Imported {created_count:,} / {len(interchange_data):,} records "
                          f"({created_count/len(interchange_data)*100:.1f}%) "
                          f"- Rate: {rate:.0f} rec/sec - ETA: {remaining/60:.1f} min")
                
                batch = []
        
        # Insert remaining records
        if batch:
            HollanderInterchange.objects.bulk_create(batch, ignore_conflicts=True)
            created_count += len(batch)
    
    elapsed = (datetime.now() - start_time).total_seconds()
    print(f"\n✓ INTERCHANGE IMPORT COMPLETE")
    print(f"  Total processed: {count:,}")
    print(f"  Total created: {created_count:,}")
    print(f"  Time elapsed: {elapsed/60:.1f} minutes")
    print(f"  Average rate: {created_count/elapsed:.0f} records/second")
    
    return count


def main():
    """Main import function"""
    print("\n" + "="*80)
    print("HOLLANDER DATA IMPORT - FULL DATABASE")
    print("="*80)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    overall_start = datetime.now()
    
    try:
        # Step 1: Load reference data
        part_types, make_model_map = load_reference_data()
        
        # Step 2: Import pricing data (577K records)
        pricing_count = import_pricing_data(part_types)
        
        # Step 3: Import interchange data (6.47M records)
        interchange_count = import_interchange_data(part_types, make_model_map)
        
        # Final summary
        total_elapsed = (datetime.now() - overall_start).total_seconds()
        
        print("\n" + "="*80)
        print("IMPORT COMPLETE!")
        print("="*80)
        print(f"  Pricing records: {pricing_count:,}")
        print(f"  Interchange records: {interchange_count:,}")
        print(f"  Total records: {pricing_count + interchange_count:,}")
        print(f"  Total time: {total_elapsed/60:.1f} minutes")
        print(f"  Finished at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("="*80)
        
        # Verify database counts
        print("\nDatabase verification:")
        print(f"  HollanderInterchange: {HollanderInterchange.objects.count():,} records")
        print(f"  PartPricing: {PartPricing.objects.count():,} records")
        print(f"  PartSpecification: {PartSpecification.objects.count():,} records")
        
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0


if __name__ == "__main__":
    exit(main())
