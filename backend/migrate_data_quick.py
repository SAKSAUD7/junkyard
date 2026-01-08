"""
Quick Data Migration Script
Copies existing vendor/make data from old tables to new Hollander tables
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.vendors.models import Vendor as OldVendor
from apps.common.models import Make as OldMake
from apps.hollander.models import Vendor as HollanderVendor, Make as HollanderMake
from django.db import transaction

def migrate_vendors():
    """Copy vendors from vendors_vendor to hollander_vendor"""
    print("\n" + "="*60)
    print("MIGRATING VENDORS")
    print("="*60)
    
    old_vendors = OldVendor.objects.all()
    print(f"Found {old_vendors.count()} vendors in old table")
    
    batch = []
    for idx, old in enumerate(old_vendors, 1):
        # Create corresponding Hollander vendor
        new_vendor = HollanderVendor(
            yard_id=old.id,  # Use old vendor ID as yard_id
            name=old.name,
            address=getattr(old, 'address', ''),
            city=getattr(old, 'city', ''),
            state=getattr(old, 'state', ''),
            zip_code=getattr(old, 'zip', '') or getattr(old, 'zip_code', ''),
            phone=getattr(old, 'phone', ''),
            email=getattr(old, 'email', ''),
            website=getattr(old, 'website', ''),
            is_active=True,  # Set all as active
        )
        batch.append(new_vendor)
    
    HollanderVendor.objects.bulk_create(batch, ignore_conflicts=True)
    print(f"✓ Migrated {len(batch)} vendors to hollander_vendor")
    return len(batch)

def migrate_makes():
    """Copy makes from common_make to hollander_make"""
    print("\n" + "="*60)
    print("MIGRATING MAKES")
    print("="*60)
    
    old_makes = OldMake.objects.all()
    print(f"Found {old_makes.count()} makes in old table")
    
    batch = []
    for idx, old in enumerate(old_makes, 1):
        # Create corresponding Hollander make
        new_make = HollanderMake(
            make_id=getattr(old, 'make_id', idx),  # Use old ID if exists, otherwise enumerate
            make_name=old.name if hasattr(old, 'name') else str(old)
        )
        batch.append(new_make)
    
    HollanderMake.objects.bulk_create(batch, ignore_conflicts=True)
    print(f"✓ Migrated {len(batch)} makes to hollander_make")
    return len(batch)

def main():
    print("\n" + "="*60)
    print("DATA MIGRATION: Old Tables → Hollander Tables")
    print("="*60)
    
    try:
        with transaction.atomic():
            vendor_count = migrate_vendors()
            make_count = migrate_makes()
        
        print("\n" + "="*60)
        print("✅ MIGRATION COMPLETE!")
        print("="*60)
        print(f"Vendors migrated: {vendor_count}")
        print(f"Makes migrated: {make_count}")
        print(f"\nYour data is now available in the Hollander tables!")
        print("="*60)
        
        return 0
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    exit(main())
