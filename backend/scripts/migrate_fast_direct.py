import os
import sys
import sqlite3
import psycopg2
import csv
import io
import time
from datetime import datetime
from dotenv import load_dotenv

# Load env
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(base_dir, '.env'))

# Configuration
SQLITE_DB_PATH = os.path.join(base_dir, 'db.sqlite3')

# Azure Connection
DB_HOST = os.environ.get('DB_HOST', "junk.postgres.database.azure.com")
DB_USER = os.environ.get('DB_USER', "junkyard_admin")
DB_PASSWORD = os.environ.get('DB_PASSWORD', "saksaud@7411")
DB_NAME = os.environ.get('DB_NAME', "junkyard")
DB_PORT = os.environ.get('DB_PORT', 5432)

# Mappings (SQLite Table -> Postgres Table)
TABLE_MAPPINGS = {
    'hollander_index': 'hollander_hollanderindex',
    'hollander_profile_visit': 'hollander_profilevisit',
    'hollander_zipcode': 'hollander_zipcode',
    'hollander_vehicle_image': 'hollander_vehicleimage',
    'hollander_interchange': 'hollander_interchange',
    'users': 'users',
    'vendor_profiles': 'vendor_profiles',
    'hollander_yard_make': 'hollander_yardmake',
    'hollander_yard_part': 'hollander_yardparts',
    'hollander_legacy_account': 'hollander_legacyaccount',
    'hollander_legacy_user': 'hollander_legacyuser',
}

def get_sqlite_conn():
    return sqlite3.connect(SQLITE_DB_PATH)

def get_pg_conn():
    return psycopg2.connect(
        host=DB_HOST,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        port=DB_PORT,
        sslmode='require'
    )

def migrate_table(sqlite_table, pg_table):
    print(f"\n🚀 Migrating {sqlite_table} -> {pg_table}...")
    
    # 1. Connect to SQLite and get headers
    s_conn = get_sqlite_conn()
    s_cursor = s_conn.cursor()
    
    # Verify table exists in SQLite
    try:
        s_cursor.execute(f"PRAGMA table_info({sqlite_table})")
        columns_info = s_cursor.fetchall()
        if not columns_info:
            print(f"⚠️  Table {sqlite_table} not found in SQLite. Skipping.")
            return
        
        # SQLite columns
        s_cols = [c[1] for c in columns_info]
        print(f"   SQLite Cols: {len(s_cols)}")
        
    except Exception as e:
        print(f"❌ Error reading SQLite schema: {e}")
        return

    # 2. Connect to Postgres and get headers
    try:
        p_conn = get_pg_conn()
        p_cursor = p_conn.cursor()
        
        p_cursor.execute(f"SELECT column_name FROM information_schema.columns WHERE table_name = '{pg_table}' ORDER BY ordinal_position")
        p_cols = [row[0] for row in p_cursor.fetchall()]
        print(f"   Postgres Cols: {len(p_cols)}")
        
        if not p_cols:
            print(f"❌ Table {pg_table} not found in Postgres. Skipping.")
            return
            
    except Exception as e:
        print(f"❌ Error connection to Postgres: {e}")
        return

    # 3. Stream Data
    print(f"   ⚡ Disabling constraints & Truncating {pg_table}...")
    p_cursor.execute("SET session_replication_role = 'replica';")
    p_cursor.execute(f"TRUNCATE TABLE {pg_table} CASCADE;")
    p_conn.commit()

    BATCH_SIZE = 50000
    buffer = io.StringIO()
    writer = csv.writer(buffer, delimiter='\t', quotechar='"', quoting=csv.QUOTE_MINIMAL)
    
    # Select all from SQLite
    s_cursor.execute(f"SELECT * FROM {sqlite_table}")
    
    count = 0
    total_migrated = 0
    
    while True:
        rows = s_cursor.fetchmany(BATCH_SIZE)
        if not rows:
            break
            
        for row in rows:
            # Map Row: SQLite Row -> Dict -> Postgres Row
            row_dict = dict(zip(s_cols, row))
            
            pg_row = []
            for col in p_cols:
                # Handle ID/PK mapping
                if col == 'username' and 'email' in row_dict and ('username' not in row_dict or not row_dict['username']):
                     val = row_dict['email']
                elif col in row_dict:
                    val = row_dict[col]
                else:
                    # Defaults
                    if col in ['created_at', 'updated_at', 'date_joined']:
                         val = datetime.now().isoformat()
                    elif col in ['is_active', 'is_staff', 'is_superuser']:
                         val = False 
                    elif col == 'password': # explicit default for missing password
                         val = '!' # Django unusable password
                    else:
                         val = None
                
                # Clean value
                if val is None:
                    pg_row.append(r'\N')
                elif isinstance(val, (bool)):
                    pg_row.append('t' if val else 'f')
                elif isinstance(val, str):
                    pg_row.append(val.replace('\x00', '').replace('\r', '').replace('\n', '\\n'))
                else:
                    pg_row.append(val)
            
            writer.writerow(pg_row)
            count += 1
            
        # Copy to Postgres
        buffer.seek(0)
        try:
            p_cursor.copy_from(buffer, pg_table, null=r'\N', sep='\t', columns=p_cols)
            p_conn.commit()
            total_migrated += count
            print(f"   ⚡ Migrated {total_migrated} rows...", end='\r')
        except psycopg2.Error as e:
            print(f"\n❌ COPY Error in batch: {e}")
            
        buffer.close()
        buffer = io.StringIO()
        writer = csv.writer(buffer, delimiter='\t', quotechar='"', quoting=csv.QUOTE_MINIMAL)
        count = 0
        
    print(f"\n✅ Finished {sqlite_table} -> {pg_table}: {total_migrated} rows.")
    # Re-enable handled by session end, but explicit:
    p_cursor.execute("SET session_replication_role = 'origin';")
    p_conn.commit()
    p_conn.close()
    s_conn.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python migrate_fast_direct.py [sqlite_table_name] [postgres_table_name]")
        # Default run all?
        # Or hardcode list
        sys.exit(1)
        
    st = sys.argv[1]
    pt = sys.argv[2]
    migrate_table(st, pt)
