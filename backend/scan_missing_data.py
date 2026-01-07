"""
Check All JSON Files for Hollander Number Data
===============================================
Find any files we haven't imported that might have Hollander numbers
"""
import os
import json
from pathlib import Path

JSON_DIR = Path(r"c:\Users\saksa\Videos\jynm_json\jynm_json")

print("\n" + "="*70)
print("SCANNING ALL JSON FILES FOR HOLLANDER NUMBER DATA")
print("="*70)

# Files we've already imported
imported_files = {
    'tabqappartprice_final.json',  # Main PartPricing source
    '_yard.json',  # Vendors
    '_model.json',  # Models
    '_make.json',  # Makes
    'O_IndexList.json',  # HollanderIndex
    'O_XTabMakeModelRef.json',  # Make/Model refs
    'O_XTabPartRef.json',  # Part refs
}

print(f"\nAlready imported: {len(imported_files)} files")

# Scan all JSON files
all_files = list(JSON_DIR.glob("*.json"))
print(f"Total JSON files found: {len(all_files)}")

print("\n" + "="*70)
print("CHECKING EACH FILE FOR HOLLANDER NUMBER DATA")
print("="*70)

potential_sources = []

for file in all_files:
    if file.name in imported_files:
        continue
    
    try:
        size_mb = file.stat().st_size / (1024 * 1024)
        
        # Skip very large files (>100MB) for quick scan
        if size_mb > 100:
            print(f"\n⏭️  Skipping {file.name} (too large: {size_mb:.1f}MB)")
            continue
        
        print(f"\n📄 Checking: {file.name} ({size_mb:.1f}MB)")
        
        with open(file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Check structure
        if isinstance(data, list) and len(data) > 0:
            sample = data[0]
            keys = sample.keys() if isinstance(sample, dict) else []
            
            # Look for Hollander-related fields
            hollander_fields = [k for k in keys if 'hollander' in k.lower() or 'holl' in k.lower()]
            option_fields = [k for k in keys if 'option' in k.lower()]
            
            if hollander_fields or option_fields:
                print(f"   ✅ FOUND POTENTIAL DATA!")
                print(f"   - Records: {len(data):,}")
                print(f"   - Hollander fields: {hollander_fields}")
                print(f"   - Option fields: {option_fields}")
                print(f"   - Sample keys: {list(keys)[:10]}")
                potential_sources.append((file.name, len(data), hollander_fields, option_fields))
            else:
                print(f"   ⚠️  No Hollander/Option fields found")
                print(f"   - Sample keys: {list(keys)[:10]}")
    
    except Exception as e:
        print(f"   ❌ Error reading file: {e}")

print("\n" + "="*70)
print("SUMMARY OF POTENTIAL NEW DATA SOURCES")
print("="*70)

if potential_sources:
    print(f"\nFound {len(potential_sources)} files with potential Hollander data:\n")
    for name, count, holl_fields, opt_fields in potential_sources:
        print(f"📦 {name}")
        print(f"   Records: {count:,}")
        print(f"   Hollander fields: {holl_fields}")
        print(f"   Option fields: {opt_fields}")
        print()
else:
    print("\n❌ No additional files found with Hollander number data")
    print("All available Hollander data has been imported!")

print("="*70)
