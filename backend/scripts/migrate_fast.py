import os
import json
import psycopg2
import csv
import io
import argparse
import sys
from datetime import datetime
from urllib.parse import urlparse
from dotenv import load_dotenv

# Load env
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(base_dir, '.env'))

# Increase CSV field size limit (Safe value for Windows C long)
csv.field_size_limit(2147483647)

# Map Django model names to DB table names (if different)
# Mostly defaults apply (app_model), but we can verify.
TABLE_MAPPINGS = {
    'hollander.hollanderindex': 'hollander_hollanderindex',
    'hollander.profilevisit': 'hollander_profilevisit',
    'hollander.zipcode': 'hollander_zipcode',
    'hollander.vehicleimage': 'hollander_vehicleimage',
    'hollander.yardmake': 'hollander_yardmake',
    'hollander.yardparts': 'hollander_yardparts',
    'users.user': 'users',
    'users.vendorprofile': 'vendor_profiles',
    'hollander.legacyaccount': 'hollander_legacyaccount', # checking defaults
    'hollander.legacyuser': 'hollander_legacyuser'
}

def get_db_connection():
    """Establish connection to Azure PostgreSQL"""
    try:
        # Pushing for speed, sslmode required
        # Fallback to hardcoded credentials if env vars missing
        conn = psycopg2.connect(
            host=os.environ.get('DB_HOST', 'junk.postgres.database.azure.com'),
            database=os.environ.get('DB_NAME', 'junkyard'),
            user=os.environ.get('DB_USER', 'junkyard_admin'),
            password=os.environ.get('DB_PASSWORD', 'saksaud@7411'),
            port=os.environ.get('DB_PORT', 5432),
            sslmode='require'
        )
        return conn
    except Exception as e:
        print(f"❌ Connection Failed: {e}")
        sys.exit(1)

def get_table_columns(cursor, table_name):
    """Fetch column names for the table to ensure correct order"""
    cursor.execute(f"SELECT column_name FROM information_schema.columns WHERE table_name = '{table_name}' ORDER BY ordinal_position")
    cols = [row[0] for row in cursor.fetchall()]
    return cols

def process_table(table_key, jsonl_path):
    print(f"\n🚀 Starting Migration for {table_key}")
    
    if not os.path.exists(jsonl_path):
        print(f"⚠️ Source file not found: {jsonl_path}. Waiting or skipping...")
        return

    db_table = TABLE_MAPPINGS.get(table_key, table_key.replace('.', '_'))
    
    conn = get_db_connection()
    conn.autocommit = True # We might want transactions, but let's do batch commits
    cursor = conn.cursor()

    # Disable constraints for this session
    cursor.execute("SET session_replication_role = 'replica';")
    
    # Get columns
    try:
        db_cols = get_table_columns(cursor, db_table)
        if not db_cols:
            print(f"❌ Table {db_table} does not exist in DB.")
            # Debug: list tables
            cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
            start_tables = [r[0] for r in cursor.fetchall()]
            print(f"   Available tables: {start_tables}")
            return
    except Exception as e:
        print(f"❌ Error getting schema: {e}")
        return

    print(f"ℹ️  Target Table: {db_table} ({len(db_cols)} columns)")
    print(f"    Columns: {db_cols}")

    # Preparation for COPY
    BATCH_SIZE = 100 # Reduced for debug
    buffer = io.StringIO()
    writer = csv.writer(buffer, delimiter='\t', quotechar='"', quoting=csv.QUOTE_MINIMAL)
    
    count = 0
    total_migrated = 0
    
    # Defaults for NOT NULL fields
    now_str = datetime.now().isoformat()
    DEFAULT_VALUES = {
        'created_at': now_str,
        'updated_at': now_str,
        'date_joined': now_str,
        'is_active': True,
        'is_staff': False,
        'is_superuser': False,
        'email_verified': False,
        'user_type': 'customer'
    }

    with open(jsonl_path, 'r', encoding='utf-8') as f:
        for line in f:
            if not line.strip(): continue
            try:
                data = json.loads(line)
                
                # Check if model matches (if file has mixed models)
                model_in_file = data.get('model')
                if model_in_file != table_key:
                    # if count == 0: print(f"⚠️ Skipping mismatch: File has {model_in_file}, expecting {table_key}")
                    continue

                # Prepare Row
                pk = data.get('pk')
                fields = data.get('fields', {})
                
                row = []
                for col in db_cols:
                    if col == 'id':
                        row.append(pk)
                    elif col in fields:
                        val = fields[col]
                        if val is None and col in DEFAULT_VALUES:
                            val = DEFAULT_VALUES[col]
                        
                        # Handle JSON/List/Dict types?
                        if isinstance(val, (dict, list)):
                            row.append(json.dumps(val))
                        elif val is None:
                            row.append(None)
                        else:
                            row.append(val)
                    else:
                        # Missing in JSON, check defaults
                        if col == 'username' and 'email' in fields:
                            row.append(fields['email'])
                        elif col in DEFAULT_VALUES:
                            row.append(DEFAULT_VALUES[col])
                        else:
                            row.append(None)
                
                # Clean row for CSV
                clean_row = []
                for item in row:
                    if item is None:
                        clean_row.append(r'\N')
                    else:
                        if isinstance(item, str):
                            clean_row.append(item.replace('\x00', '').replace('\r', '').replace('\n', '\\n'))
                        else:
                            clean_row.append(item)
                
                writer.writerow(clean_row)
                count += 1
                
                if count >= BATCH_SIZE:
                    # Flush to DB
                    print(f"🔄 Flushing {count} rows...")
                    buffer.seek(0)
                    try:
                        cursor.copy_from(buffer, db_table, null=r'\N', sep='\t', columns=db_cols)
                        total_migrated += count
                        print(f"✅ Migrated {total_migrated} rows...", end='\r')
                    except psycopg2.Error as e:
                        err_msg = f"COPY Error: {e.pgcode} - {e.pgerror}\nDETAIL: {e.diag.message_primary if e.diag else 'No detail'}"
                        print(f"\n❌ {err_msg}")
                        with open('migration_error.log', 'w') as log:
                            log.write(f"Columns: {db_cols}\n")
                            log.write(f"PK Value: {pk}\n")
                            log.write(f"Row Data: {clean_row}\n")
                            log.write(err_msg)
                        return # Stop on error
                    
                    buffer.close()
                    buffer = io.StringIO()
                    writer = csv.writer(buffer, delimiter='\t', quotechar='"', quoting=csv.QUOTE_MINIMAL)
                    count = 0
                    
            except json.JSONDecodeError:
                pass
    
    # Final flush
    if count > 0:
        print(f"🔄 Final Flush {count} rows...")
        buffer.seek(0)
        try:
            cursor.copy_from(buffer, db_table, null=r'\N', sep='\t', columns=db_cols)
            total_migrated += count
        except psycopg2.Error as e:
            print(f"\n❌ Final COPY Error: {e.pgcode} - {e.pgerror}")

    print(f"\n✨ {table_key} Migration Complete. Total: {total_migrated}")
    conn.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--tables', nargs='+', required=True, help='List of tables to migrate (e.g. hollander.zipcode)')
    args = parser.parse_args()
    
    # Mapping of tables to their expected JSONL files from extractor
    # We scan the backend/ dir for best match or hardcode
    FILE_MAP = {
        'hollander.hollanderindex': 'hollander_index.jsonl',
        'hollander.profilevisit': 'profile_visit.jsonl',
        'hollander.zipcode': 'zipcode.jsonl',
        'hollander.vehicleimage': 'vehicle_image.jsonl',
        'hollander.yardmake': 'yard_make.jsonl',
        'hollander.yardparts': 'yard_part.jsonl',
        'hollander.hollanderinterchange': 'interchange.jsonl',
        'users.user': 'users_user.jsonl',
        'hollander.legacyaccount': 'legacy_account.jsonl',
        'hollander.legacyuser': 'legacy_user.jsonl'
    }

    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) # backend/
    
    for table in args.tables:
        if table in FILE_MAP:
            fname = FILE_MAP[table]
            fpath = os.path.join(base_dir, fname)
            process_table(table, fpath)
        else:
            print(f"❓ Unknown file mapping for {table}")
