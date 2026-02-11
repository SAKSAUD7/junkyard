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


# Azure Blob Storage base URL
AZURE_BLOB_BASE_URL = "https://junkyardstoragedev.blob.core.windows.net/media/vendors/"

def update_vendor_logos():
    """Update vendor logo fields to point to Azure Blob Storage URLs"""
    
    print("[*] Starting vendor logo URL update...")
    
    # Get all vendors
    vendors = Vendor.objects.all()
    total_vendors = vendors.count()
    
    print(f"   Found {total_vendors} vendors in database")
    
    updated_count = 0
    skipped_count = 0
    error_count = 0
    
    for i, vendor in enumerate(vendors, 1):
        try:
            # Check if vendor has a logo filename
            if vendor.logo and vendor.logo.strip():
                # Extract just the filename if it's already a path
                filename = os.path.basename(vendor.logo)
                
                # Construct Azure Blob URL
                azure_url = f"{AZURE_BLOB_BASE_URL}{filename}"
                
                # Update vendor logo field
                vendor.logo = azure_url
                vendor.save(update_fields=['logo'])
                
                updated_count += 1
            else:
                skipped_count += 1
            
            # Progress indicator
            if i % 100 == 0 or i == total_vendors:
                print(f"   Progress: {i}/{total_vendors} ({(i/total_vendors)*100:.1f}%) - Updated: {updated_count} | Skipped: {skipped_count} | Errors: {error_count}")
        
        except Exception as e:
            error_count += 1
            print(f"   [ERROR] Failed to update vendor {vendor.id}: {e}")
    
    print(f"\n[SUCCESS] Vendor logo update complete!")
    print(f"   Updated: {updated_count}")
    print(f"   Skipped (no logo): {skipped_count}")
    print(f"   Errors: {error_count}")
    
    return updated_count, skipped_count, error_count

if __name__ == "__main__":
    update_vendor_logos()
