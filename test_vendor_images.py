"""
Verify vendor logo URLs and test image accessibility
"""
import psycopg2
import requests
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

def verify_vendor_images():
    try:
        print("[*] Connecting to Azure PostgreSQL...")
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        print("[OK] Connected successfully!\n")
        
        # Get sample vendor logos
        print("[*] Fetching sample vendor logos...")
        cursor.execute("""
            SELECT id, name, logo 
            FROM hollander_vendor 
            WHERE logo LIKE '%blob.core.windows.net%' 
            LIMIT 5
        """)
        vendors = cursor.fetchall()
        
        print(f"[OK] Found {len(vendors)} vendors with Azure Blob URLs\n")
        
        # Test each logo URL
        print("[*] Testing image accessibility...\n")
        for vendor_id, name, logo_url in vendors:
            print(f"Vendor: {name}")
            print(f"  ID: {vendor_id}")
            print(f"  URL: {logo_url}")
            
            try:
                response = requests.head(logo_url, timeout=5)
                if response.status_code == 200:
                    print(f"  Status: [OK] 200 - Image accessible")
                else:
                    print(f"  Status: [WARNING] {response.status_code}")
            except Exception as e:
                print(f"  Status: [ERROR] {str(e)}")
            print()
        
        # Get total count
        cursor.execute("""
            SELECT COUNT(*) 
            FROM hollander_vendor 
            WHERE logo LIKE '%blob.core.windows.net%'
        """)
        total = cursor.fetchone()[0]
        
        cursor.close()
        conn.close()
        
        print(f"\n[SUCCESS] Total vendors with Azure Blob URLs: {total}")
        return True
        
    except Exception as e:
        print(f"[ERROR] {e}")
        return False

if __name__ == "__main__":
    verify_vendor_images()
