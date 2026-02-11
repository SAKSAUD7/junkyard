#!/usr/bin/env python
"""
Import script that flushes the database first to avoid conflicts.
This ensures a clean import without primary key or foreign key issues.
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.core.management import call_command

def main():
    print("=" * 60)
    print("COMPLETE DATABASE IMPORT WITH FLUSH")
    print("=" * 60)
    
    # Step 1: Flush the database (removes all data)
    print("\n⚠️  STEP 1: Flushing database (removing all existing data)...")
    print("This will delete ALL current data!")
    
    try:
        call_command('flush', '--noinput')
        print("✅ Database flushed successfully!")
    except Exception as e:
        print(f"❌ Error flushing database: {e}")
        return
    
    # Step 2: Load the data
    print("\n📥 STEP 2: Loading data from full_database_dump.json...")
    
    try:
        call_command('loaddata', 'full_database_dump.json', verbosity=2)
        print("\n✅ DATA IMPORT COMPLETE!")
    except Exception as e:
        print(f"\n❌ Error loading data: {e}")
        return
    
    # Step 3: Verify
    print("\n📊 STEP 3: Verifying import...")
    from apps.vendors.models import Vendor
    from apps.users.models import User
    from apps.leads.models import Lead
    
    vendor_count = Vendor.objects.count()
    user_count = User.objects.count()
    lead_count = Lead.objects.count()
    
    print(f"✅ Vendors: {vendor_count}")
    print(f"✅ Users: {user_count}")
    print(f"✅ Leads: {lead_count}")
    
    print("\n" + "=" * 60)
    print("IMPORT COMPLETE!")
    print("=" * 60)

if __name__ == '__main__':
    main()
