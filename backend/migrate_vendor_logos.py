"""
Vendor Logo Migration Script
Replaces placeholder logos with actual vendor logos from legacy site
Uses _yard.json which contains the Logo field mapping
"""

import os
import json
import shutil
from pathlib import Path
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.hollander.models import Vendor

# Paths
LEGACY_LOGO_DIR = r"c:\Users\saksa\OneDrive\Desktop\jynm\httpdocs00\static\uploads\account-logo"
YARD_JSON = r"c:\Users\saksa\Videos\jynm_json\jynm_json\_yard.json"
DJANGO_MEDIA_ROOT = r"c:\Users\saksa\OneDrive\Desktop\junkyard\junkyard\backend\media"
VENDOR_LOGOS_DIR = os.path.join(DJANGO_MEDIA_ROOT, "vendor_logos")

# Create vendor logos directory if it doesn't exist
os.makedirs(VENDOR_LOGOS_DIR, exist_ok=True)

def load_yard_data():
    """Load yard data from _yard.json file"""
    try:
        with open(YARD_JSON, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading _yard.json: {e}")
        return []

def migrate_vendor_logos():
    """Main migration function"""
    print("=" * 80)
    print("VENDOR LOGO MIGRATION SCRIPT")
    print("=" * 80)
    
    # Load legacy yard data
    print("\n1. Loading legacy yard data from _yard.json...")
    yard_data = load_yard_data()
    print(f"   Found {len(yard_data)} yards in JSON file")
    
    # Create a mapping of yard_id to logo filename
    yard_logo_map = {}
    yards_with_logos = 0
    for yard in yard_data:
        yard_id = yard.get('YardID')
        logo = yard.get('Logo')
        if yard_id and logo and logo != 'NULL' and logo.strip():
            yard_logo_map[str(yard_id)] = logo
            yards_with_logos += 1
    
    print(f"   Found {yards_with_logos} yards with logo files in JSON")
    
    # Get all vendors from database
    print("\n2. Loading vendors from database...")
    db_vendors = Vendor.objects.all()
    total_vendors = db_vendors.count()
    print(f"   Found {total_vendors} vendors in database")
    
    # Count vendors with placeholder vs real logos
    vendors_with_placeholder = db_vendors.filter(logo__icontains='placeholder').count()
    vendors_with_real_logos = db_vendors.exclude(logo='').exclude(logo__isnull=True).exclude(logo__icontains='placeholder').count()
    print(f"   {vendors_with_placeholder} vendors have placeholder logos")
    print(f"   {vendors_with_real_logos} vendors have real logos")
    
    # Check if logo directory exists
    if not os.path.exists(LEGACY_LOGO_DIR):
        print(f"\n✗ ERROR: Logo directory not found: {LEGACY_LOGO_DIR}")
        return
    
    # Get list of available logo files
    available_logos = set(os.listdir(LEGACY_LOGO_DIR))
    print(f"\n3. Found {len(available_logos)} logo files in legacy directory")
    
    # Process each vendor
    print("\n4. Processing vendors...")
    matched_count = 0
    copied_count = 0
    updated_count = 0
    skipped_count = 0
    not_found_count = 0
    logo_file_missing = 0
    
    for vendor in db_vendors:
        # Skip if vendor already has a real logo (not placeholder)
        if vendor.logo and 'placeholder' not in vendor.logo.lower():
            skipped_count += 1
            continue
        
        # Check if this yard_id has a logo in the mapping
        yard_id_str = str(vendor.yard_id)
        if yard_id_str not in yard_logo_map:
            not_found_count += 1
            continue
        
        logo_filename = yard_logo_map[yard_id_str]
        logo_source = os.path.join(LEGACY_LOGO_DIR, logo_filename)
        
        # Check if logo file exists
        if not os.path.exists(logo_source):
            logo_file_missing += 1
            # print(f"   ✗ Logo file missing for {vendor.yard_id}: {logo_filename}")
            continue
        
        matched_count += 1
        
        try:
            # Create a clean filename: yardid.ext
            file_ext = os.path.splitext(logo_filename)[1]
            new_filename = f"{vendor.yard_id}{file_ext}"
            destination = os.path.join(VENDOR_LOGOS_DIR, new_filename)
            
            # Copy the file
            shutil.copy2(logo_source, destination)
            copied_count += 1
            
            # Update vendor record
            vendor.logo = f"vendor_logos/{new_filename}"
            vendor.save(update_fields=['logo'])
            updated_count += 1
            
            print(f"   ✓ {vendor.yard_id}: {vendor.name[:40]:40} -> {new_filename}")
            
        except Exception as e:
            print(f"   ✗ Error processing {vendor.yard_id}: {e}")
    
    # Summary
    print("\n" + "=" * 80)
    print("MIGRATION SUMMARY")
    print("=" * 80)
    print(f"Total vendors in database:        {total_vendors}")
    print(f"Had placeholder logos:            {vendors_with_placeholder}")
    print(f"Already had real logos (skipped): {skipped_count}")
    print(f"Logos matched in JSON:            {matched_count}")
    print(f"Logo files missing on disk:       {logo_file_missing}")
    print(f"Logos copied successfully:        {copied_count}")
    print(f"Vendors updated:                  {updated_count}")
    print(f"No logo in JSON:                  {not_found_count}")
    print("=" * 80)
    
    # Verify
    vendors_with_real_logos_after = Vendor.objects.exclude(logo='').exclude(logo__isnull=True).exclude(logo__icontains='placeholder').count()
    print(f"\nBefore migration: {vendors_with_real_logos} vendors had real logos")
    print(f"After migration:  {vendors_with_real_logos_after} vendors now have real logos")
    print(f"Improvement:      +{vendors_with_real_logos_after - vendors_with_real_logos} vendors")
    print("\n" + "=" * 80)

if __name__ == "__main__":
    migrate_vendor_logos()
