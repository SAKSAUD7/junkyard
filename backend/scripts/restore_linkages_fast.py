import json
import psycopg2
import io
import csv
import os
from datetime import datetime

# Database Credentials
DB_HOST = "junk.postgres.database.azure.com"
DB_USER = "junkyard_admin"
DB_PASSWORD = "saksaud@7411"
DB_NAME = "junkyard"

make_json = os.path.join('backend', 'yard_make_recovered.json')
part_json = os.path.join('backend', 'yard_part_recovered.json')

def restore_linkages_fast():
    print(f"🚀 Starting FAST Linkage Restoration: {datetime.now()}")
    
    try:
        conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD, host=DB_HOST, sslmode="require")
        cur = conn.cursor()
        
        # --- YardMake Restoration ---
        if os.path.exists(make_json):
            print("🧹 Truncating hollander_yard_make...")
            cur.execute('TRUNCATE TABLE "hollander_yard_make" CASCADE;')
            conn.commit()
            
            print(f"📖 Streaming {make_json} to Azure...")
            with open(make_json, 'r', encoding='utf-8') as f:
                f.readline() # Skip [
                csv_buffer = io.StringIO()
                writer = csv.writer(csv_buffer)
                count = 0
                
                for line in f:
                    line = line.strip()
                    if line == ']' or line == '': continue
                    if line.endswith(','): line = line[:-1]
                    try:
                        obj = json.loads(line)
                        flds = obj['fields']
                        # vendor, make (FKs are IDs)
                        writer.writerow([flds.get('vendor'), flds.get('make')])
                        count += 1
                        if count % 50000 == 0:
                            csv_buffer.seek(0)
                            cur.copy_expert('COPY "hollander_yard_make" ("vendor_id", "make_id") FROM STDIN WITH (FORMAT CSV, HEADER FALSE)', csv_buffer)
                            conn.commit()
                            csv_buffer.close()
                            csv_buffer = io.StringIO()
                            writer = csv.writer(csv_buffer)
                            print(f"  - Uploaded {count:,} makes...", end='\r')
                    except Exception: continue
                
                if csv_buffer.tell() > 0:
                    csv_buffer.seek(0)
                    cur.copy_expert('COPY "hollander_yard_make" ("vendor_id", "make_id") FROM STDIN WITH (FORMAT CSV, HEADER FALSE)', csv_buffer)
                    conn.commit()
            print(f"\n✅ Restored {count:,} YardMake records.")
            
        # --- YardPart Restoration ---
        if os.path.exists(part_json):
            print("🧹 Truncating hollander_yard_part...")
            cur.execute('TRUNCATE TABLE "hollander_yard_part" CASCADE;')
            conn.commit()
            
            print(f"📖 Streaming {part_json} to Azure...")
            with open(part_json, 'r', encoding='utf-8') as f:
                f.readline()
                csv_buffer = io.StringIO()
                writer = csv.writer(csv_buffer)
                count = 0
                
                for line in f:
                    line = line.strip()
                    if line == ']' or line == '': continue
                    if line.endswith(','): line = line[:-1]
                    try:
                        obj = json.loads(line)
                        flds = obj['fields']
                        # vendor, part_type
                        writer.writerow([flds.get('vendor'), flds.get('part_type')])
                        count += 1
                        if count % 50000 == 0:
                            csv_buffer.seek(0)
                            cur.copy_expert('COPY "hollander_yard_part" ("vendor_id", "part_type_id") FROM STDIN WITH (FORMAT CSV, HEADER FALSE)', csv_buffer)
                            conn.commit()
                            csv_buffer.close()
                            csv_buffer = io.StringIO()
                            writer = csv.writer(csv_buffer)
                            print(f"  - Uploaded {count:,} parts...", end='\r')
                    except Exception: continue
                
                if csv_buffer.tell() > 0:
                    csv_buffer.seek(0)
                    cur.copy_expert('COPY "hollander_yard_part" ("vendor_id", "part_type_id") FROM STDIN WITH (FORMAT CSV, HEADER FALSE)', csv_buffer)
                    conn.commit()
            print(f"\n✅ Restored {count:,} YardPart records.")
            
        conn.close()
        
    except Exception as e:
        print(f"❌ Error during restoration: {e}")

if __name__ == "__main__":
    restore_linkages_fast()
