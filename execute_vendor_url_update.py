"""
Execute vendor logo URL update directly via psycopg2
"""
import psycopg2
import sys
import io

# Fix encoding for Windows console
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# Database connection
DB_CONFIG = {
    'host': 'junk.postgres.database.azure.com',
    'database': 'junkyard',
    'user': 'junkyard_admin',
    'password': 'saksaud@7411',
    'port': 5432,
    'sslmode': 'require'
}

def update_vendor_urls():
    try:
        print("[*] Connecting to Azure PostgreSQL...")
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        print("[OK] Connected successfully!")
        
        # Step 1: Check count before update
        print("\n[*] Checking vendors to update...")
        cursor.execute("""
            SELECT COUNT(*) as vendors_to_update
            FROM hollander_vendor
            WHERE logo IS NOT NULL 
              AND logo != '' 
              AND logo NOT LIKE '%blob.core.windows.net%'
        """)
        count_before = cursor.fetchone()[0]
        print(f"[OK] Vendors to update: {count_before}")
        
        if count_before == 0:
            print("[!] No vendors need updating. All URLs already point to Azure Blob Storage.")
            cursor.close()
            conn.close()
            return
        
        # Step 2: Perform update
        print(f"\n[*] Updating {count_before} vendor logo URLs...")
        cursor.execute("""
            UPDATE hollander_vendor
            SET logo = CONCAT('https://junkyardstoragedev.blob.core.windows.net/media/vendors/', 
                              SUBSTRING(logo FROM '[^/]+$'))
            WHERE logo IS NOT NULL 
              AND logo != '' 
              AND logo NOT LIKE '%blob.core.windows.net%'
        """)
        rows_updated = cursor.rowcount
        conn.commit()
        print(f"[OK] Updated {rows_updated} vendor records")
        
        # Step 3: Verify update
        print("\n[*] Verifying update...")
        cursor.execute("""
            SELECT COUNT(*) as updated_vendors
            FROM hollander_vendor
            WHERE logo LIKE '%blob.core.windows.net%'
        """)
        count_after = cursor.fetchone()[0]
        print(f"[OK] Total vendors with Azure Blob URLs: {count_after}")
        
        # Step 4: Sample verification
        print("\n[*] Sample updated records:")
        cursor.execute("""
            SELECT id, name, logo
            FROM hollander_vendor
            WHERE logo LIKE '%blob.core.windows.net%'
            LIMIT 5
        """)
        samples = cursor.fetchall()
        for vendor_id, name, logo in samples:
            print(f"  - {name}: {logo}")
        
        # Step 5: Check remaining
        cursor.execute("""
            SELECT COUNT(*) as remaining_old_paths
            FROM hollander_vendor
            WHERE logo IS NOT NULL 
              AND logo != '' 
              AND logo NOT LIKE '%blob.core.windows.net%'
        """)
        remaining = cursor.fetchone()[0]
        print(f"\n[*] Remaining old paths: {remaining}")
        
        cursor.close()
        conn.close()
        
        print("\n[SUCCESS] Vendor logo URL update complete!")
        print(f"  - Updated: {rows_updated} vendors")
        print(f"  - Total with Azure URLs: {count_after}")
        print(f"  - Remaining old paths: {remaining}")
        
        return True
        
    except Exception as e:
        print(f"[ERROR] {e}")
        return False

if __name__ == "__main__":
    update_vendor_urls()
