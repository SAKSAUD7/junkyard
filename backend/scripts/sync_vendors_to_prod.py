
import os
import sys
import django
import psycopg2
from dotenv import load_dotenv

# Setup Django Environment (for reading local SQLite)
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
sys.path.append(backend_dir)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
load_dotenv(os.path.join(backend_dir, '.env'))

django.setup()

from apps.hollander.models import Vendor

# Azure Postgres config
DB_NAME = os.environ.get('DB_NAME')
DB_USER = os.environ.get('DB_USER')
DB_PASSWORD = os.environ.get('DB_PASSWORD')
DB_HOST = os.environ.get('DB_HOST')
DB_PORT = os.environ.get('DB_PORT', '5432')

def sync_data():
    print("[*] Syncing Vendors from Local SQLite (Django ORM) to Azure PostgreSQL...")
    
    # 1. Read from Local SQLite using Django ORM
    # Filter for updated logos (path contains 'vendor_logos/')
    # vendor.logo is an ImageField, so we check if it contains the path string
    updated_vendors = Vendor.objects.filter(logo__icontains='vendor_logos/')
    count = updated_vendors.count()
    
    print(f"   Found {count} vendors locally with updated logos.")
    
    if count == 0:
        print("   No updated vendors found. Aborting sync.")
        return

    # 2. Connect to Azure Postgres
    print("[*] Connecting to REMOTE Azure PostgreSQL...")
    try:
        pg_conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT,
            sslmode='require'
        )
        pg_cursor = pg_conn.cursor()
    except Exception as e:
        print(f"[ERROR] Failed to connect to Postgres: {e}")
        return

    print("[*] Syncing data...")
    synced_count = 0
    error_count = 0
    
    # Get table name from Django model
    table_name = Vendor._meta.db_table
    print(f"   Target Table: {table_name}")

    for vendor in updated_vendors:
        try:
            # We only want to update the logo field
            logo_url = str(vendor.logo)
            
            # Update Postgres
            # Use id to match
            query = f"UPDATE {table_name} SET logo = %s WHERE id = %s"
            pg_cursor.execute(query, (logo_url, vendor.id))
            
            synced_count += 1
            if synced_count % 100 == 0:
                print(f"   Synced: {synced_count}/{count} ({vendor.name})")
                
        except Exception as e:
            error_count += 1
            print(f"   [ERROR] Failed to update ID {vendor.id}: {e}")
            pg_conn.rollback() 
            continue

    pg_conn.commit()
    print(f"\n[SUCCESS] Sync Complete!")
    print(f"   Synced: {synced_count}")
    print(f"   Errors: {error_count}")
    
    pg_conn.close()

if __name__ == "__main__":
    sync_data()
