"""
Run vendor logo URL update locally by connecting directly to Azure PostgreSQL
This is an alternative to running the script from Azure SSH
"""
import os
import psycopg2
from dotenv import load_dotenv

# Load environment variables
load_dotenv('backend/.env')

# Azure PostgreSQL connection details
DB_CONFIG = {
    'host': 'junk.postgres.database.azure.com',
    'database': 'junkyard',
    'user': 'junkyard_admin',
    'password': 'saksaud@7411',
    'port': 5432,
    'sslmode': 'require'
}

# Azure Blob Storage base URL
AZURE_BLOB_BASE_URL = "https://junkyardstoragedev.blob.core.windows.net/media/vendors/"

def update_vendor_logos():
    """Update vendor logo URLs to point to Azure Blob Storage"""
    
    print("[*] Connecting to Azure PostgreSQL...")
    
    try:
        # Connect to database
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        print("[*] Connected successfully!")
        print("[*] Fetching vendors...")
        
        # Get all vendors with logos
        cursor.execute("SELECT id, name, logo FROM hollander_vendor WHERE logo IS NOT NULL AND logo != ''")
        vendors = cursor.fetchall()
        
        total_vendors = len(vendors)
        print(f"[*] Found {total_vendors} vendors with logos")
        
        updated_count = 0
        skipped_count = 0
        
        for i, (vendor_id, vendor_name, logo) in enumerate(vendors, 1):
            try:
                # Skip if already using Azure Blob URL
                if 'blob.core.windows.net' in logo:
                    skipped_count += 1
                    continue
                
                # Extract filename
                filename = logo.split('/')[-1] if '/' in logo else logo
                
                # Construct Azure Blob URL
                azure_url = f"{AZURE_BLOB_BASE_URL}{filename}"
                
                # Update vendor
                cursor.execute(
                    "UPDATE hollander_vendor SET logo = %s WHERE id = %s",
                    (azure_url, vendor_id)
                )
                updated_count += 1
                
                # Progress indicator
                if i % 100 == 0 or i == total_vendors:
                    print(f"   Progress: {i}/{total_vendors} ({(i/total_vendors)*100:.1f}%) - Updated: {updated_count} | Skipped: {skipped_count}")
            
            except Exception as e:
                print(f"   [ERROR] Failed to update vendor {vendor_id} ({vendor_name}): {e}")
        
        # Commit changes
        conn.commit()
        
        print(f"\n[SUCCESS] Vendor logo update complete!")
        print(f"   Updated: {updated_count}")
        print(f"   Skipped (already Azure URLs): {skipped_count}")
        print(f"   Total processed: {total_vendors}")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"[ERROR] Database connection failed: {e}")
        print("\nTroubleshooting:")
        print("1. Check if your IP is whitelisted in Azure PostgreSQL firewall")
        print("2. Verify database credentials are correct")
        print("3. Ensure SSL is enabled")
        return 1
    
    return 0

if __name__ == "__main__":
    import sys
    sys.exit(update_vendor_logos())
