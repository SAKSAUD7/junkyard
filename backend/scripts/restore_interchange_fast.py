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

data_json = os.path.join('backend', 'interchange_recovered.json')

def restore_interchange_fast():
    print(f"🚀 Starting FAST Interchange Restoration: {datetime.now()}")
    
    if not os.path.exists(data_json):
        print(f"❌ Error: {data_json} not found.")
        return

    try:
        conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD, host=DB_HOST, sslmode="require")
        cur = conn.cursor()
        
        # 1. Truncate Table
        print("🧹 Truncating hollander_interchange...")
        cur.execute('TRUNCATE TABLE "hollander_interchange" CASCADE;')
        conn.commit()
        
        # 2. Prepare COPY
        # Columns from models.py: hollander_number, year_start, year_end, make, model, part_type, part_name, options, notes, mfr_code, part_type_number
        cols = [
            'hollander_number', 'year_start', 'year_end', 'make', 'model', 
            'part_type', 'part_name', 'options', 'notes', 'mfr_code', 'part_type_number'
        ]
        cols_str = ', '.join([f'"{c}"' for c in cols])
        
        chunk_size = 50000
        buffer_data = []
        count = 0
        
        print(f"📖 Streaming {data_json} to Azure...")
        
        with open(data_json, 'r', encoding='utf-8') as f:
            f.readline() # Skip [
            
            csv_buffer = io.StringIO()
            writer = csv.writer(csv_buffer)
            
            for line in f:
                line = line.strip()
                if line == ']' or line == '': continue
                if line.endswith(','): line = line[:-1]
                
                try:
                    obj = json.loads(line)
                    flds = obj['fields']
                    
                    row = [
                        flds.get('hollander_number', ''),
                        flds.get('year_start', 0),
                        flds.get('year_end', 0),
                        flds.get('make', ''),
                        flds.get('model', ''),
                        flds.get('part_type', ''),
                        flds.get('part_name', ''),
                        flds.get('options', ''),
                        flds.get('notes', ''),
                        flds.get('mfr_code', ''),
                        flds.get('part_type_number', '')
                    ]
                    writer.writerow(row)
                    count += 1
                    
                    if count % chunk_size == 0:
                        csv_buffer.seek(0)
                        cur.copy_expert(f'COPY "hollander_interchange" ({cols_str}) FROM STDIN WITH (FORMAT CSV, HEADER FALSE)', csv_buffer)
                        conn.commit()
                        csv_buffer.close()
                        csv_buffer = io.StringIO()
                        writer = csv.writer(csv_buffer)
                        print(f"✅ Extracted & Uploaded {count:,} records...", end='\r')
                        
                except json.JSONDecodeError:
                    continue
            
            # Flush remaining
            if csv_buffer.tell() > 0:
                csv_buffer.seek(0)
                cur.copy_expert(f'COPY "hollander_interchange" ({cols_str}) FROM STDIN WITH (FORMAT CSV, HEADER FALSE)', csv_buffer)
                conn.commit()
                
        print(f"\n✅ COMPLETE: Restored {count:,} interchange records.")
        conn.close()
        
    except Exception as e:
        print(f"❌ Error during restoration: {e}")

if __name__ == "__main__":
    restore_interchange_fast()
