import os
import sqlite3
import psycopg2
import io
import csv
from datetime import datetime

# Database Paths/Credentials
SQLITE_DB = os.path.join(os.getcwd(), 'backend', 'db.sqlite3')
PG_HOST = "junk.postgres.database.azure.com"
PG_USER = "junkyard_admin"
PG_PASS = "saksaud@7411"
PG_NAME = "junkyard"

BATCH_SIZE = 5000

def migrate_linkage():
    print(f"🚀 Starting Linkage Migration: {datetime.now()}")
    
    s_conn = sqlite3.connect(SQLITE_DB)
    s_cur = s_conn.cursor()
    
    p_conn = psycopg2.connect(dbname=PG_NAME, user=PG_USER, password=PG_PASS, host=PG_HOST, sslmode="require")
    p_cur = p_conn.cursor()
    
    tables = ['hollander_yard_make', 'hollander_yard_part']
    
    for table in tables:
        print(f"📦 Migrating {table}...")
        
        # 1. Truncate Target
        p_cur.execute(f'TRUNCATE TABLE "{table}" CASCADE;')
        p_conn.commit()
        
        # 2. Get Columns
        s_cur.execute(f"PRAGMA table_info({table})")
        cols = [c[1] for c in s_cur.fetchall()]
        cols_str = ', '.join([f'"{c}"' for c in cols])
        
        # 3. Transfer with COPY
        s_cur.execute(f"SELECT * FROM {table}")
        
        rows_migrated = 0
        while True:
            rows = s_cur.fetchmany(BATCH_SIZE)
            if not rows:
                break
                
            csv_buffer = io.StringIO()
            writer = csv.writer(csv_buffer)
            writer.writerows(rows)
            csv_buffer.seek(0)
            
            p_cur.copy_expert(f'COPY "{table}" ({cols_str}) FROM STDIN WITH (FORMAT CSV, HEADER FALSE)', csv_buffer)
            rows_migrated += len(rows)
            if rows_migrated % 50000 == 0:
                print(f"   Transferring... {rows_migrated:,} rows", end='\r')
                
        p_conn.commit()
        print(f"\n✅ Finished {table}: {rows_migrated:,} rows.")
        
    p_conn.close()
    s_conn.close()
    print(f"🏁 Linkage Migration Complete: {datetime.now()}")

if __name__ == "__main__":
    migrate_linkage()
