"""
Import Hollander Pricing Data from tabqappartprice_final.json
==============================================================
Imports 576K+ pricing records with make, model, part, year, options, and Hollander numbers
"""

import os
import sys
import django
import json
from decimal import Decimal

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.hollander.models import PartPricing


# Make code mapping from abbreviated codes to proper names
MAKE_CODE_MAPPING = {
    'AC': 'Acura',
    'AL': 'Alfa Romeo',
    'AM': 'AMC',
    'AU': 'Audi',
    'BE': 'Bertone',
    'BM': 'BMW',
    'BU': 'Buick',
    'CA': 'Cadillac',
    'CH': 'Chevrolet',
    'CO': 'Chrysler',  # Could also be Dodge, context dependent
    'CR': 'Chrysler',
    'DA': 'Daewoo',
    'DH': 'Daihatsu',
    'DO': 'Dodge',
    'EA': 'Eagle',
    'FD': 'Ford',
    'FI': 'Fiat',
    'FO': 'Ford',
    'GE': 'Geo',
    'GM': 'GMC',
    'HA': 'Honda',
    'HO': 'Honda',
    'HU': 'Hummer',
    'HY': 'Hyundai',
    'IN': 'Infiniti',
    'IS': 'Isuzu',
    'JA': 'Jaguar',
    'JP': 'Jeep',
    'KI': 'Kia',
    'LR': 'Land Rover',
    'LE': 'Lexus',
    'LI': 'Lincoln',
    'MA': 'Mazda',
    'MB': 'Mercedes Benz',
    'ME': 'Mercury',
    'MK': 'Merkur',
    'MI': 'Mini',
    'MT': 'Mitsubishi',
    'NI': 'Nissan',
    'OL': 'Oldsmobile',
    'PE': 'Peugeot',
    'PN': 'Pininfarina',
    'PL': 'Plymouth',
    'PO': 'Pontiac',
    'PR': 'Porsche',
    'RE': 'Renault',
    'RV': 'Rover',
    'SA': 'Saab',
    'ST': 'Saturn',
    'SC': 'Scion',
    'SL': 'Sterling',
    'SU': 'Subaru',
    'SZ': 'Suzuki',
    'TY': 'Toyota',
    'TO': 'Toyota',
    'VA': 'Volkswagen',
    'VL': 'Volvo',
    'VW': 'Volkswagen',
    'VO': 'Volvo',
    'YU': 'Yugo',
    'GN': 'Genesis',
    'OP': 'Opel',
    'RO': 'Rover',
}



def import_pricing_data(json_file_path):
    """Import pricing data from JSON file"""
    
    print("\n" + "="*70)
    print("IMPORTING HOLLANDER PRICING DATA")
    print("="*70)
    
    # Check if file exists
    if not os.path.exists(json_file_path):
        print(f"❌ Error: File not found: {json_file_path}")
        return
    
    print(f"\n📂 Reading JSON file: {json_file_path}")
    
    try:
        with open(json_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        print(f"✓ Loaded {len(data):,} records from JSON")
        
    except Exception as e:
        print(f"❌ Error reading JSON file: {e}")
        return
    
    # Clear existing data
    print("\n🗑️  Clearing existing PartPricing data...")
    existing_count = PartPricing.objects.count()
    if existing_count > 0:
        PartPricing.objects.all().delete()
        print(f"   ✓ Deleted {existing_count:,} existing records")
    else:
        print("   ✓ No existing records to delete")
    
    # Import data in batches
    print("\n📥 Importing data...")
    batch_size = 1000
    batch = []
    imported_count = 0
    skipped_count = 0
    
    for idx, item in enumerate(data, 1):
        try:
            # Extract data from JSON
            hollander_number = item.get('Hollander', '').strip()
            make_code = item.get('Make', '').strip()
            
            # Skip if no Hollander number
            if not hollander_number:
                skipped_count += 1
                continue
            
            # Convert make code to proper name
            proper_make = MAKE_CODE_MAPPING.get(make_code, make_code)
            
            # Create PartPricing record
            record = PartPricing(
                hollander_number=hollander_number,
                make=proper_make,  # Use proper make name
                model=item.get('Model', '').strip(),
                part_name=item.get('Part_Name', '').strip(),
                year_start=int(item.get('StartYear', 0)) if item.get('StartYear') else 0,
                year_end=int(item.get('EndYear', 0)) if item.get('EndYear') else 0,
                
                # Price fields (convert to Decimal)
                new_price=Decimal(item.get('newPrice', 0)) if item.get('newPrice') else None,
                wow_price=Decimal(item.get('wowPrice', 0)) if item.get('wowPrice') else None,
                cts_price=Decimal(item.get('ctsPrice', 0)) if item.get('ctsPrice') else None,
                
                # Options fields
                option1=item.get('NewOption1', '').strip(),
                option2=item.get('NewOption2', '').strip(),
                option3=item.get('NewOption3', '').strip(),
                option4=item.get('NewOption4', '').strip(),
                option5=item.get('NewOption5', '').strip(),
                option6=item.get('NewOption6', '').strip(),
                option7=item.get('NewOption7', '').strip(),
                option8=item.get('NewOption8', '').strip(),
                option9=item.get('NewOption9', '').strip(),
                option10=item.get('NewOption10', '').strip(),
                option11=item.get('NewOption11', '').strip(),
            )
            
            batch.append(record)
            
            # Bulk create when batch is full
            if len(batch) >= batch_size:
                PartPricing.objects.bulk_create(batch, ignore_conflicts=True)
                imported_count += len(batch)
                print(f"   Progress: {imported_count:,} / {len(data):,} records ({(imported_count/len(data)*100):.1f}%)", end='\r')
                batch = []
        
        except Exception as e:
            print(f"\n   ⚠️  Error processing record {idx}: {e}")
            skipped_count += 1
            continue
    
    # Insert remaining records
    if batch:
        PartPricing.objects.bulk_create(batch, ignore_conflicts=True)
        imported_count += len(batch)
    
    print(f"\n\n✅ Import completed!")
    print(f"   Total records in JSON: {len(data):,}")
    print(f"   Successfully imported: {imported_count:,}")
    print(f"   Skipped: {skipped_count:,}")
    
    # Verify import
    print("\n📊 VERIFICATION:")
    print("-" * 70)
    final_count = PartPricing.objects.count()
    print(f"   Total records in database: {final_count:,}")
    
    # Show sample records
    print("\n📋 Sample records:")
    samples = PartPricing.objects.all()[:5]
    for sample in samples:
        print(f"   - {sample.hollander_number}: {sample.make} {sample.model} {sample.part_name} ({sample.year_start}-{sample.year_end})")
        if sample.option1:
            print(f"     Options: {sample.get_all_options()}")
    
    print("\n" + "="*70)
    print("✅ IMPORT COMPLETE")
    print("="*70)


if __name__ == "__main__":
    # Path to the JSON file
    json_file = r"c:\Users\saksa\Videos\jynm_json\jynm_json\tabqappartprice_final.json"
    
    import_pricing_data(json_file)
