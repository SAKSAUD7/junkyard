import psycopg2
import os

DB_HOST = "junk.postgres.database.azure.com"
DB_USER = "junkyard_admin"
DB_PASSWORD = "saksaud@7411"
DB_NAME = "junkyard"

TABLES_TO_CHECK = [
    'users',
    'hollander_index',
    'hollander_profile_visit',
    'hollander_zipcode',
    'hollander_yard_make',
    'hollander_yard_part',
    'hollander_part_pricing',  # <--- Requested
    'hollander_make',          # <--- Requested
    'hollander_model',         # <--- Requested
    'hollander_part_type',     # <--- Requested
    'hollander_make_model_ref',
    'hollander_vehicle_image',
    'vendor_profiles',
    'hollander_vendor', 
]

try:
    conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD, host=DB_HOST, sslmode="require")
    cur = conn.cursor()
    
    with open('backend/migration_report.txt', 'w') as f:
        f.write(f"{'TABLE':<30} | {'ROWS (Azure)':<15}\n")
        f.write("-" * 50 + "\n")
        
        for table in TABLES_TO_CHECK:
            try:
                cur.execute(f"SELECT COUNT(*) FROM {table}")
                count = cur.fetchone()[0]
                f.write(f"{table:<30} | {count:<15,}\n")
            except Exception as e:
                f.write(f"{table:<30} | ❌ (Error)\n")
                conn.rollback()

    print("Report generated: backend/migration_report.txt")

    conn.close()

except Exception as e:
    print(f"Connection Error: {e}")
