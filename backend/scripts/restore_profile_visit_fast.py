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

data_json = os.path.join('backend', 'profile_visit_recovered.json')

def restore_logs_fast():
    print(f"🚀 Starting FAST ProfileVisit Restoration: {datetime.now()}")
    
    if not os.path.exists(data_json):
        print(f"❌ Error: {data_json} not found.")
        return

    try:
        conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD, host=DB_HOST, sslmode="require")
        cur = conn.cursor()
        
        # 1. Truncate Table
        print("🧹 Truncating hollander_profile_visit...")
        cur.execute('TRUNCATE TABLE "hollander_profile_visit" CASCADE;')
        conn.commit()
        
        # 2. Prepare COPY
        # Columns: tracking_id, account_id, created_on
        cols_str = '"tracking_id", "account_id", "created_on"'
        
        chunk_size = 100000
        buffer_data = []
        count = 0
        
        print(f"📖 Streaming {data_json} to Azure...")
        
        # Use ijson or similar if installed, but for now we'll read the array manually or use standard json load if memory allows (3.7M might be tight for 8GB RAM, but let's try iterative if possible. Standard json.load is risky).
        # Since I wrote it as a standard JSON array [ ... ], I have to load it all or parse it carefully.
        # Given the "really fast" requirement, I'll assume I can load it or I should have written it as JSONL.
        # Check: MegaExtractor writes JSON array "[\n ... ,\n ... ]".
        # This is memory intensive to load at once.
        # Better to use a streaming parser or just read the file line by line since I know the format.
        
        with open(data_json, 'r', encoding='utf-8') as f:
            # Skip first line "["
            f.readline()
            
            csv_buffer = io.StringIO()
            writer = csv.writer(csv_buffer)
            
            for line in f:
                line = line.strip()
                if line == ']' or line == '': continue
                if line.endswith(','): line = line[:-1]
                
                try:
                    obj = json.loads(line)
                    flds = obj['fields']
                    
                    writer.writerow([
                        flds.get('tracking_id'),
                        flds.get('account_id'),
                        flds.get('created_on')
                    ])
                    count += 1
                    
                    if count % chunk_size == 0:
                        csv_buffer.seek(0)
                        cur.copy_expert(f'COPY "hollander_profile_visit" ({cols_str}) FROM STDIN WITH (FORMAT CSV, HEADER FALSE)', csv_buffer)
                        conn.commit()
                        csv_buffer.close()
                        csv_buffer = io.StringIO()
                        writer = csv.writer(csv_buffer)
                        print(f"✅ Extracted & Uploaded {count:,} logs...", end='\r')
                        
                except json.JSONDecodeError:
                    continue
            
            # Flush remaining
            if csv_buffer.tell() > 0:
                csv_buffer.seek(0)
                cur.copy_expert(f'COPY "hollander_profile_visit" ({cols_str}) FROM STDIN WITH (FORMAT CSV, HEADER FALSE)', csv_buffer)
                conn.commit()
                
        print(f"\n✅ COMPLETE: Restored {count:,} profile visits.")
        conn.close()
        
    except Exception as e:
        print(f"❌ Error during restoration: {e}")

if __name__ == "__main__":
    restore_logs_fast()
