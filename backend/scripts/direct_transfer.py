import sqlite3
import psycopg2
import os
import sys
import io
import csv

# Setup Paths and Config
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SQLITE_DB = os.path.join(BASE_DIR, 'db.sqlite3')

# Azure Connection
DB_HOST = "junk.postgres.database.azure.com"
DB_USER = "junkyard_admin"
DB_PASSWORD = "saksaud@7411"
DB_NAME = "junkyard"
DB_PORT = "5432"

def get_postgres_conn():
    return psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT,
        sslmode="require"
    )

def transfer_table(sqlite_cursor, pg_cursor, table_name):
    print(f"📦 Transferring {table_name}...")
    
    # 1. Get Columns from SQLite
    try:
        sqlite_cursor.execute(f"PRAGMA table_info({table_name})")
    except Exception as e:
        print(f"   ⚠️ Could not read {table_name} from SQLite: {e}")
        return

    columns_info = sqlite_cursor.fetchall()
    if not columns_info:
        print(f"   ⚠️ Table {table_name} empty or missing in SQLite.")
        return
        
    # Extract column names (SQLite PRAGMA returns: cid, name, type, notnull, dflt_value, pk)
    columns = [col[1] for col in columns_info]
    
    # 2. Read Data Generator
    sqlite_cursor.execute(f"SELECT * FROM {table_name}")
    
    # Use StringIO as a buffer for COPY
    BATCH_SIZE = 5000 # Smaller batch to be safe
    total_rows = 0
    
    while True:
        rows = sqlite_cursor.fetchmany(BATCH_SIZE)
        if not rows:
            break
            
        csv_buffer = io.StringIO()
        writer = csv.writer(csv_buffer)
        writer.writerows(rows)
        csv_buffer.seek(0)
        
        try:
            # 3. Fast COPY to Postgres
            cols_str = ', '.join([f'"{c}"' for c in columns])
            sql = f"COPY {table_name} ({cols_str}) FROM STDIN WITH (FORMAT CSV, HEADER FALSE)"
            pg_cursor.copy_expert(sql, csv_buffer)
            total_rows += len(rows)
            print(f"   ... transferred {total_rows} rows", end='\r')
        except Exception as e:
            print(f"\n   ❌ Error copying batch: {e}")
            # Try to print first row of bad batch for debug
            print(f"   Sample data: {rows[0]}")
            raise e

    print(f"\n   ✅ Finished {table_name}: {total_rows} rows.")

def main():
    if not os.path.exists(SQLITE_DB):
        print("❌ SQLite Database not found!")
        return

    print("🚀 Starting High-Speed Transfer (SQLite -> Azure)")
    
    try:
        # Connect to both
        s_conn = sqlite3.connect(SQLITE_DB)
        s_cur = s_conn.cursor()
        
        p_conn = get_postgres_conn()
        p_cur = p_conn.cursor()
        
        # Order of operations (Topological Sort rough approximation)
        tables_to_migrate = [
            # 1. Core Config & Auth
            'hollander_country',
            'hollander_state',
            'hollander_zipcode',
            'users_user',       # Custom User Model
            # 'auth_user',      # Skip standard auth if users_user is used, or handle carefully
            
            # 2. Reference Data
            'hollander_make',
            'hollander_part_type',
            'hollander_model',          # FK: Make
            'hollander_year_range',     # FK: Make, Model
            
            # 3. Vendor Core
            'hollander_vendor',
            'hollander_vendor_detail',  # OneToOne: Vendor
            'hollander_vendor_hours',   # FK: Vendor
            'hollander_vendor_rating',  # FK: Vendor
            'hollander_yard_make',      # FK: Vendor, Make
            'hollander_yard_part',      # FK: Vendor, PartType
            
            # 4. Large Data / Interchange
            'hollander_interchange',
            'hollander_index',
            'hollander_part_pricing',       # FK: Vendor (nullable)
            'hollander_part_specification', # FK: Pricing
            
            # 5. Legacy / Other
            'hollander_legacy_account',
            'hollander_legacy_user',
            'hollander_association',
            'hollander_profile_visit',
            'hollander_vehicle_image',
            
            # 6. App Data
            'leads_lead',
            'yard_submissions_yardsubmission',
            'common_carbrand',
            'common_carmodel',
            'common_category',
            'common_part',
        ]
        
        # Get actual tables in SQLite
        s_cur.execute("SELECT name FROM sqlite_master WHERE type='table';")
        all_sqlite_tables = [row[0] for row in s_cur.fetchall()]
        
        # Determine valid tables to run
        valid_tables = [t for t in tables_to_migrate if t in all_sqlite_tables]
        
        print(f"📊 Found {len(valid_tables)} tables to migrate.")
        
        # Operations
        for table in valid_tables:
            # Clean Target First
            print(f"🧹 Truncating {table} on Azure...")
            try:
                p_cur.execute(f"TRUNCATE TABLE {table} CASCADE;") 
                p_conn.commit()
            except Exception as e:
                print(f"   ⚠️ Warning: Could not truncate {table} (Might not exist). Error: {e}")
                p_conn.rollback()
            
            # Transfer
            try:
                transfer_table(s_cur, p_cur, table)
                p_conn.commit() # Commit after each table to save progress
            except Exception as e:
                print(f"   ❌ Skipping table {table} due to error.")
                p_conn.rollback()

        p_conn.close()
        s_conn.close()
        print("\n🎉 Migration Complete!")
        
    except Exception as e:
        print(f"\n❌ Critical Error: {e}")

if __name__ == '__main__':
    main()
