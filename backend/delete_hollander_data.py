"""
Delete All Hollander Data from Database
========================================
This script will DELETE ALL Hollander-related data from the database:
- HollanderInterchange (18M+ records)
- PartPricing (577K+ records)
- PartSpecification
- Make
- Model
- PartType
- YearRange

WARNING: This is IRREVERSIBLE! All Hollander data will be permanently deleted.
"""

import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.hollander.models import (
    Make, Model, PartType, YearRange,
    HollanderInterchange, PartPricing, PartSpecification
)


def delete_all_hollander_data():
    """Delete all Hollander data from the database"""
    
    print("\n" + "="*70)
    print("DELETE ALL HOLLANDER DATA FROM DATABASE")
    print("="*70)
    
    # First, show what will be deleted
    print("\n📊 CURRENT DATABASE STATUS:")
    print("-" * 70)
    
    try:
        interchange_count = HollanderInterchange.objects.count()
        pricing_count = PartPricing.objects.count()
        spec_count = PartSpecification.objects.count()
        make_count = Make.objects.count()
        model_count = Model.objects.count()
        parttype_count = PartType.objects.count()
        yearrange_count = YearRange.objects.count()
        
        print(f"  HollanderInterchange: {interchange_count:,} records")
        print(f"  PartPricing: {pricing_count:,} records")
        print(f"  PartSpecification: {spec_count:,} records")
        print(f"  Make: {make_count:,} records")
        print(f"  Model: {model_count:,} records")
        print(f"  PartType: {parttype_count:,} records")
        print(f"  YearRange: {yearrange_count:,} records")
        
        total_records = (interchange_count + pricing_count + spec_count + 
                        make_count + model_count + parttype_count + yearrange_count)
        print(f"\n  TOTAL RECORDS TO DELETE: {total_records:,}")
        
    except Exception as e:
        print(f"❌ Error counting records: {e}")
        return
    
    # Confirm deletion
    print("\n" + "="*70)
    print("⚠️  WARNING: THIS WILL PERMANENTLY DELETE ALL HOLLANDER DATA!")
    print("="*70)
    print("\nThis action cannot be undone. All Hollander data will be removed.")
    
    confirmation = input("\nType 'DELETE ALL HOLLANDER DATA' to confirm: ")
    
    if confirmation != "DELETE ALL HOLLANDER DATA":
        print("\n❌ Deletion cancelled. No data was deleted.")
        return
    
    print("\n🗑️  DELETING ALL HOLLANDER DATA...")
    print("-" * 70)
    
    # Delete in order (child tables first to avoid foreign key issues)
    try:
        # 1. PartSpecification (has FK to PartPricing)
        print("\n1. Deleting PartSpecification records...")
        deleted = PartSpecification.objects.all().delete()
        print(f"   ✓ Deleted {deleted[0]:,} PartSpecification records")
        
        # 2. PartPricing
        print("\n2. Deleting PartPricing records...")
        deleted = PartPricing.objects.all().delete()
        print(f"   ✓ Deleted {deleted[0]:,} PartPricing records")
        
        # 3. HollanderInterchange
        print("\n3. Deleting HollanderInterchange records...")
        deleted = HollanderInterchange.objects.all().delete()
        print(f"   ✓ Deleted {deleted[0]:,} HollanderInterchange records")
        
        # 4. YearRange (has FK to Make and Model)
        print("\n4. Deleting YearRange records...")
        deleted = YearRange.objects.all().delete()
        print(f"   ✓ Deleted {deleted[0]:,} YearRange records")
        
        # 5. Model (has FK to Make)
        print("\n5. Deleting Model records...")
        deleted = Model.objects.all().delete()
        print(f"   ✓ Deleted {deleted[0]:,} Model records")
        
        # 6. Make
        print("\n6. Deleting Make records...")
        deleted = Make.objects.all().delete()
        print(f"   ✓ Deleted {deleted[0]:,} Make records")
        
        # 7. PartType
        print("\n7. Deleting PartType records...")
        deleted = PartType.objects.all().delete()
        print(f"   ✓ Deleted {deleted[0]:,} PartType records")
        
        print("\n" + "="*70)
        print("✅ ALL HOLLANDER DATA HAS BEEN DELETED SUCCESSFULLY")
        print("="*70)
        
        # Verify deletion
        print("\n📊 FINAL DATABASE STATUS:")
        print("-" * 70)
        print(f"  HollanderInterchange: {HollanderInterchange.objects.count():,} records")
        print(f"  PartPricing: {PartPricing.objects.count():,} records")
        print(f"  PartSpecification: {PartSpecification.objects.count():,} records")
        print(f"  Make: {Make.objects.count():,} records")
        print(f"  Model: {Model.objects.count():,} records")
        print(f"  PartType: {PartType.objects.count():,} records")
        print(f"  YearRange: {YearRange.objects.count():,} records")
        print("\n✅ All Hollander tables are now empty.")
        
    except Exception as e:
        print(f"\n❌ Error during deletion: {e}")
        print("Some data may have been deleted. Check database status.")
        return


if __name__ == "__main__":
    delete_all_hollander_data()
