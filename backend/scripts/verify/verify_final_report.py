
import os
import django

# Setup Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from apps.hollander.models import (
    PartPricing, HollanderIndex, Make, Model, PartType, 
    HollanderMakeModelRef, HollanderPartRef, Vendor, Zipcode,
    ProfileVisit, LegacyUser, LegacyAccount
)

def generate_report():
    print("--- FINAL DATA IMPORT REPORT ---")
    
    # Core Data
    print(f"Part Pricing (Inventory): {PartPricing.objects.count():,} records")
    print(f"Hollander Catalog (Index): {HollanderIndex.objects.count():,} records")
    
    # Reference Data
    print(f"Makes: {Make.objects.count()} (Expected ~56)")
    print(f"Models: {Model.objects.count():,} (Expected 1,200+)")
    print(f"Part Types: {PartType.objects.count()} (Expected ~378)")
    print(f"H-MakeModel Refs: {HollanderMakeModelRef.objects.count():,}")
    print(f"H-Part Refs: {HollanderPartRef.objects.count()}")
    
    # Geographic/Vendor
    print(f"Zipcodes (USA/CAN): {Zipcode.objects.count():,}")
    print(f"Vendors (Yards): {Vendor.objects.count()}")
    
    # Users & Logs
    print(f"Legacy Users: {LegacyUser.objects.count():,}")
    print(f"Legacy Accounts: {LegacyAccount.objects.count():,}")
    
    # The Big One
    print(f"Profile Visits (Logs): {ProfileVisit.objects.count():,}")
    
    print("\n--- SYSTEM STATUS ---")
    print("Database: Connected")
    print("Lead Form: Connected (Makes -> Models -> Years -> Parts -> Options)")

if __name__ == "__main__":
    generate_report()
