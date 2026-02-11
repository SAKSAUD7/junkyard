"""
Complete Hollander Data Import Script
======================================
Imports ALL Hollander data from JSON files:
1. Reference Data: Makes, Models, Part Types, Year Ranges
2. Interchange Data: 18M+ Hollander records
3. Pricing Data: 577K+ records with options

Total Import Time: ~45-60 minutes
"""

import os
import json
import django
from datetime import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.hollander.models import (
    Make, Model, PartType, YearRange,
    HollanderInterchange, PartPricing
)
from django.db import transaction

# File paths
BASE_DIR = r"c:\Users\saksa\Videos\jynm_json\jynm_json"
MAKE_FILE = os.path.join(BASE_DIR, "_make.json")
MODEL_FILE = os.path.join(BASE_DIR, "_model.json")
PARTTYPE_FILE = os.path.join(BASE_DIR, "_parttype.json")
YEARS_FILE = os.path.join(BASE_DIR, "years_by_make_model.json")
INTERCHANGE_FILE = os.path.join(BASE_DIR, "O_IndexList.json")
PRICING_FILE = os.path.join(BASE_DIR, "tabqappartprice_final.json")

# Batch size for bulk inserts
BATCH_SIZE = 1000


def import_makes():
    """Import vehicle makes from _make.json"""
    print("\n" + "="*80)
    print("STEP 1: IMPORTING MAKES")
    print("="*80)
    
    with open(MAKE_FILE, 'r', encoding='utf-8') as f:
        makes_data = json.load(f)
    
    batch = []
    for item in makes_data:
        make = Make(
            make_id=int(item['MakeID']),
            make_name=item['MakeName']
        )
        batch.append(make)
    
    Make.objects.bulk_create(batch, ignore_conflicts=True)
    print(f"✓ Imported {len(batch)} makes")
    return {m.make_id: m for m in Make.objects.all()}


def import_models(make_map):
    """Import vehicle models from _model.json"""
    print("\n" + "="*80)
    print("STEP 2: IMPORTING MODELS")
    print("="*80)
    
    with open(MODEL_FILE, 'r', encoding='utf-8') as f:
        models_data = json.load(f)
    
    batch = []
    count = 0
    for item in models_data:
        make_id = int(item['MakeID'])
        if make_id in make_map:
            model = Model(
                model_id=int(item['ModelID']),
                make=make_map[make_id],
                model_name=item['ModelName']
            )
            batch.append(model)
            count += 1
            
            if len(batch) >= BATCH_SIZE:
                Model.objects.bulk_create(batch, ignore_conflicts=True)
                print(f"  Imported {count} models...")
                batch = []
    
    if batch:
        Model.objects.bulk_create(batch, ignore_conflicts=True)
    
    print(f"✓ Imported {count} models")
    return {m.model_id: m for m in Model.objects.all()}


def import_part_types():
    """Import part types from _parttype.json"""
    print("\n" + "="*80)
    print("STEP 3: IMPORTING PART TYPES")
    print("="*80)
    
    with open(PARTTYPE_FILE, 'r', encoding='utf-8') as f:
        parts_data = json.load(f)
    
    batch = []
    for item in parts_data:
        part = PartType(
            part_id=int(item['PartID']),
            part_name=item['PartName']
        )
        batch.append(part)
    
    PartType.objects.bulk_create(batch, ignore_conflicts=True)
    print(f"✓ Imported {len(batch)} part types")
    return {str(p.part_id): p.part_name for p in PartType.objects.all()}


def import_year_ranges(make_map, model_map):
    """Import year ranges from years_by_make_model.json"""
    print("\n" + "="*80)
    print("STEP 4: IMPORTING YEAR RANGES")
    print("="*80)
    
    with open(YEARS_FILE, 'r', encoding='utf-8') as f:
        years_data = json.load(f)
    
    batch = []
    count = 0
    
    # Create reverse lookup for makes and models by name
    make_name_map = {m.make_name: m for m in Make.objects.all()}
    model_name_map = {}
    for model in Model.objects.select_related('make').all():
        key = f"{model.make.make_name}_{model.model_name}"
        model_name_map[key] = model
    
    for make_name, models in years_data.items():
        if make_name in make_name_map:
            make_obj = make_name_map[make_name]
            for model_name, year_info in models.items():
                key = f"{make_name}_{model_name}"
                if key in model_name_map:
                    model_obj = model_name_map[key]
                    yr = YearRange(
                        make=make_obj,
                        model=model_obj,
                        year_start=year_info['start'],
                        year_end=year_info['end']
                    )
                    batch.append(yr)
                    count += 1
    
    YearRange.objects.bulk_create(batch, ignore_conflicts=True)
    print(f"✓ Imported {count} year ranges")


def import_interchange_data(part_type_map):
    """Import Hollander interchange data from O_IndexList.json"""
    print("\n" + "="*80)
    print("STEP 5: IMPORTING HOLLANDER INTERCHANGE DATA (18M+ records)")
    print("="*80)
    print("This will take 30-45 minutes...")
    
    batch = []
    count = 0
    created_count = 0
    start_time = datetime.now()
    
    # Create make/model lookup from reference data
    make_code_map = {}
    for make in Make.objects.all():
        # Try to map common codes (this is a simplified mapping)
        if make.make_name == "Chevrolet":
            make_code_map["GM"] = make.make_name
        elif make.make_name == "Ford":
            make_code_map["FD"] = make.make_name
        # Add more mappings as needed
        make_code_map[make.make_name[:2].upper()] = make.make_name
    
    with open(INTERCHANGE_FILE, 'r', encoding='utf-8') as f:
        interchange_data = json.load(f)
        
        for item in interchange_data:
            # Get part type name
            part_type_code = item.get('PartTypeNbr', '')
            part_type_name = part_type_map.get(part_type_code, f"Part-{part_type_code}")
            
            # Get make/model
            make_code = item.get('MfrCd', '')
            model_name = item.get('ModelNm', '')
            make_name = make_code_map.get(make_code, make_code)
            
            # Create HollanderInterchange record
            record = HollanderInterchange(
                hollander_number=item.get('IDXID', ''),
                year_start=int(item.get('BeginYear', 0)),
                year_end=int(item.get('EndYear', 0)),
                make=make_name,
                model=model_name,
                part_type=part_type_name,
                part_name=part_type_name,
                mfr_code=make_code,
                part_type_number=part_type_code,
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


def import_pricing_data():
    """Import pricing data with options from tabqappartprice_final.json"""
    print("\n" + "="*80)
    print("STEP 6: IMPORTING PRICING DATA (577K records with options)")
    print("="*80)
    print("This will take 10-15 minutes...")
    
    batch = []
    count = 0
    created_count = 0
    start_time = datetime.now()
    
    with open(PRICING_FILE, 'r', encoding='utf-8') as f:
        pricing_data = json.load(f)
        
        for item in pricing_data:
            # Create PartPricing record with all option fields
            pricing = PartPricing(
                hollander_number=item.get('Hollander', ''),
                make=item.get('Make', ''),
                model=item.get('Model', ''),
                part_name=item.get('Part_Name', ''),
                year_start=int(item.get('Year', 0)) if item.get('Year') else 0,
                year_end=int(item.get('Year', 0)) if item.get('Year') else 0,
                new_price=item.get('newPrice'),
                wow_price=item.get('wowPrice'),
                cts_price=item.get('ctsPrice'),
                option1=item.get('NewOption1', ''),
                option2=item.get('NewOption2', ''),
                option3=item.get('NewOption3', ''),
                option4=item.get('NewOption4', ''),
                option5=item.get('NewOption5', ''),
                option6=item.get('NewOption6', ''),
                option7=item.get('NewOption7', ''),
                option8=item.get('NewOption8', ''),
                option9=item.get('NewOption9', ''),
                option10=item.get('NewOption10', ''),
                option11=item.get('NewOption11', ''),
            )
            batch.append(pricing)
            count += 1
            
            # Bulk insert every BATCH_SIZE records
            if len(batch) >= BATCH_SIZE:
                PartPricing.objects.bulk_create(batch, ignore_conflicts=True)
                created_count += len(batch)
                
                # Progress update every 10,000 records
                if created_count % 10000 == 0:
                    elapsed = (datetime.now() - start_time).total_seconds()
                    rate = created_count / elapsed if elapsed > 0 else 0
                    remaining = (len(pricing_data) - created_count) / rate if rate > 0 else 0
                    print(f"  Imported {created_count:,} / {len(pricing_data):,} records "
                          f"({created_count/len(pricing_data)*100:.1f}%) "
                          f"- Rate: {rate:.0f} rec/sec - ETA: {remaining/60:.1f} min")
                
                batch = []
        
        # Insert remaining records
        if batch:
            PartPricing.objects.bulk_create(batch, ignore_conflicts=True)
            created_count += len(batch)
    
    elapsed = (datetime.now() - start_time).total_seconds()
    print(f"\n✓ PRICING IMPORT COMPLETE")
    print(f"  Total processed: {count:,}")
    print(f"  Total created: {created_count:,}")
    print(f"  Time elapsed: {elapsed/60:.1f} minutes")
    print(f"  Average rate: {created_count/elapsed:.0f} records/second")
    
    return count


def main():
    """Main import function"""
    print("\n" + "="*80)
    print("COMPLETE HOLLANDER DATA IMPORT")
    print("="*80)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    overall_start = datetime.now()
    
    try:
        # Step 1-4: Import reference data
        make_map = import_makes()
        model_map = import_models(make_map)
        part_type_map = import_part_types()
        import_year_ranges(make_map, model_map)
        
        # Step 5: Import interchange data (18M records)
        interchange_count = import_interchange_data(part_type_map)
        
        # Step 6: Import pricing data (577K records)
        pricing_count = import_pricing_data()
        
        # Step 7: Rebuild Year Ranges automatically
        print("\n" + "="*80)
        print("STEP 7: REBUILDING YEAR RANGES (Strict Filter)")
        print("="*80)
        try:
            # Import dynamically to avoid setup issues or circular imports
            import importlib.util
            spec = importlib.util.spec_from_file_location("rebuild_year_ranges", "rebuild_year_ranges.py")
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            module.rebuild_years()
        except Exception as e:
            print(f"Warning: Failed to rebuild years: {e}")

        # Final summary
        total_elapsed = (datetime.now() - overall_start).total_seconds()
        
        print("\n" + "="*80)
        print("IMPORT COMPLETE!")
        print("="*80)
        print(f"  Makes: {Make.objects.count():,}")
        print(f"  Models: {Model.objects.count():,}")
        print(f"  Part Types: {PartType.objects.count():,}")
        print(f"  Year Ranges: {YearRange.objects.count():,}")
        print(f"  Interchange records: {HollanderInterchange.objects.count():,}")
        print(f"  Pricing records: {PartPricing.objects.count():,}")
        print(f"  Total time: {total_elapsed/60:.1f} minutes")
        print(f"  Finished at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("="*80)
        print("\n✅ Your lead form now has access to:")
        print("   - 54 vehicle makes")
        print("   - 2,000+ vehicle models")
        print("   - 400+ part types")
        print("   - 18M+ Hollander interchange records")
        print("   - 577K+ pricing records with detailed options")
        print("\n🚀 Ready to test at http://localhost:3000")
        
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0


if __name__ == "__main__":
    exit(main())
