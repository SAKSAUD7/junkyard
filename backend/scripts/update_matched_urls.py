
import os
import sys
import django
from dotenv import load_dotenv

# Setup Django Environment
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
sys.path.append(backend_dir)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

# Load .env
load_dotenv(os.path.join(backend_dir, '.env'))

django.setup()

from apps.hollander.models import Vendor

# Azure Blob Storage base URL for VENDOR LOGOS
# Note: This points to the 'media' container and 'vendor_logos' directory/prefix
AZURE_BLOB_BASE_URL = "https://junkyardstoragedev.blob.core.windows.net/media/vendor_logos/"

def update_vendor_logos():
    """Update vendor logo fields to point to Azure Blob Storage URLs"""
    
    print("[*] Starting vendor logo URL update...")
    
    # Get all vendors with logos
    # filter for logos that are NOT already azure URLs and NOT empty
    vendors = Vendor.objects.exclude(logo='').exclude(logo__startswith='http')
    total_vendors = vendors.count()
    
    print(f"   Found {total_vendors} vendors with local logo paths to update")
    
    updated_count = 0
    skipped_count = 0
    error_count = 0
    
    for i, vendor in enumerate(vendors, 1):
        try:
            current_logo = str(vendor.logo)
            # Expecting format like "vendor_logos/filename.jpg"
            if 'vendor_logos/' in current_logo:
                filename = os.path.basename(current_logo)
                
                # Construct Azure Blob URL
                azure_url = f"{AZURE_BLOB_BASE_URL}{filename}"
                
                # Update vendor logo field
                vendor.logo = azure_url
                vendor.save(update_fields=['logo'])
                
                updated_count += 1
                if i % 100 == 0:
                   print(f"   Updated: {vendor.name} -> {azure_url}")
            else:
                # Unexpected format, maybe old path?
                skipped_count += 1
                # print(f"   Skipped (format mismatch): {current_logo}")

            # Progress indicator
            if i % 1000 == 0 or i == total_vendors:
                print(f"   Progress: {i}/{total_vendors} - Updated: {updated_count}")
        
        except Exception as e:
            error_count += 1
            print(f"   [ERROR] Failed to update vendor {vendor.id}: {e}")
    
    print(f"\n[SUCCESS] Vendor logo URL update complete!")
    print(f"   Updated: {updated_count}")
    print(f"   Skipped: {skipped_count}")
    print(f"   Errors: {error_count}")

if __name__ == "__main__":
    update_vendor_logos()
