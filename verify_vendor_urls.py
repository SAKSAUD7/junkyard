"""
Verify vendor logo URLs after Azure Blob Storage update
Run this after updating vendor URLs to confirm all changes were successful
"""
import psycopg2
import sys

# Azure PostgreSQL connection
DB_CONFIG = {
    'host': 'junk.postgres.database.azure.com',
    'database': 'junkyard',
    'user': 'junkyard_admin',
    'password': 'saksaud@7411',
    'port': 5432,
    'sslmode': 'require'
}

def verify_vendor_urls():
    """Verify vendor logo URLs point to Azure Blob Storage"""
    
    print("[*] Connecting to Azure PostgreSQL...")
    
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        print("[*] Running verification queries...\n")
        
        # Total vendors
        cursor.execute("SELECT COUNT(*) FROM hollander_vendor")
        total_vendors = cursor.fetchone()[0]
        print(f"Total vendors: {total_vendors}")
        
        # Vendors with logos
        cursor.execute("SELECT COUNT(*) FROM hollander_vendor WHERE logo IS NOT NULL AND logo != ''")
        vendors_with_logos = cursor.fetchone()[0]
        print(f"Vendors with logos: {vendors_with_logos}")
        
        # Vendors with Azure Blob URLs
        cursor.execute("SELECT COUNT(*) FROM hollander_vendor WHERE logo LIKE '%blob.core.windows.net%'")
        azure_blob_urls = cursor.fetchone()[0]
        print(f"Vendors with Azure Blob URLs: {azure_blob_urls}")
        
        # Vendors with old local paths
        cursor.execute("SELECT COUNT(*) FROM hollander_vendor WHERE logo IS NOT NULL AND logo != '' AND logo NOT LIKE '%blob.core.windows.net%'")
        old_paths = cursor.fetchone()[0]
        print(f"Vendors with old local paths: {old_paths}")
        
        # Sample Azure Blob URLs
        print("\n[*] Sample vendor logos (first 5):")
        cursor.execute("SELECT id, name, logo FROM hollander_vendor WHERE logo LIKE '%blob.core.windows.net%' LIMIT 5")
        samples = cursor.fetchall()
        for vendor_id, name, logo in samples:
            print(f"  - {name}: {logo}")
        
        # Verification summary
        print("\n" + "="*70)
        if azure_blob_urls == vendors_with_logos and old_paths == 0:
            print("✅ SUCCESS! All vendor logos are using Azure Blob Storage URLs")
            print(f"   {azure_blob_urls}/{vendors_with_logos} vendors updated (100%)")
        elif azure_blob_urls > 0:
            print(f"⚠️  PARTIAL: {azure_blob_urls}/{vendors_with_logos} vendors updated ({(azure_blob_urls/vendors_with_logos)*100:.1f}%)")
            print(f"   {old_paths} vendors still have old paths")
        else:
            print("❌ NOT UPDATED: No vendors are using Azure Blob Storage URLs")
            print("   Please run the update SQL query or script")
        print("="*70)
        
        cursor.close()
        conn.close()
        
        return 0 if azure_blob_urls == vendors_with_logos else 1
        
    except Exception as e:
        print(f"[ERROR] Connection failed: {e}")
        print("\nNote: If firewall blocks connection, use Azure Portal Query Editor:")
        print("  Portal → PostgreSQL 'junk' → Query editor → Run verification queries")
        return 1

if __name__ == "__main__":
    sys.exit(verify_vendor_urls())
