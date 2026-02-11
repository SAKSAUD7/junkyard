import os
import json
import psycopg2
import time
import io
import csv
from concurrent.futures import ThreadPoolExecutor

# Azure Connection
DB_HOST = "junk.postgres.database.azure.com"
DB_USER = "junkyard_admin"
DB_PASSWORD = "saksaud@7411"
DB_NAME = "junkyard"

# Configuration
FILES_TO_MONITOR = {
    'hollander_index.jsonl': {
        'table': 'hollander_hollanderindex',
        'columns': ['idx_id', 'model_nm', 'part_type_nbr', 'mfr_cd', 'begin_year', 'end_year']
    },
    'profile_visit.jsonl': {
        'table': 'hollander_profile_visit',
        'columns': ['tracking_id', 'account_id', 'created_on']
    },
    'zipcode.jsonl': {
        'table': 'hollander_zipcode',
        'columns': ['zipcode_id', 'postal_code', 'city_name', 'state_abbr', 'county_name', 'latitude', 'longitude']
    },
    'interchange.jsonl': {
        'table': 'hollander_interchange',
        'columns': ['hollander_number', 'year_start', 'year_end', 'make', 'model', 'part_type', 'part_name', 'options', 'notes', 'mfr_code', 'part_type_number']
    },
    'vehicle_image.jsonl': {
        'table': 'hollander_vehicle_image',
        'columns': ['image_id', 'image_target_id', 'image_category_id', 'image_file_name', 'image_title', 'image_created_on', 'image_deleted']
    }
}

CHUNK_SIZE = 50000

def get_db_connection():
    return psycopg2.connect(dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD, host=DB_HOST, sslmode="require")

def upload_worker(filename, config):
    filepath = os.path.join('backend', filename)
    table = config['table']
    columns = config['columns']
    cols_str = ', '.join([f'"{c}"' for c in columns])
    
    print(f"⏳ Waiting for {filename}...")
    while not os.path.exists(filepath):
        time.sleep(2)
        
    print(f"🚀 Started processing {filename} -> {table}")
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Truncate first (assuming fresh start for these tables)
        # cur.execute(f'TRUNCATE TABLE "{table}" CASCADE;')
        # conn.commit()
        
        with open(filepath, 'r', encoding='utf-8') as f:
            csv_buffer = io.StringIO()
            writer = csv.writer(csv_buffer)
            count = 0
            total_uploaded = 0
            
            while True:
                line = f.readline()
                if not line:
                    # End of file, wait for more data? 
                    # For simplicity in this script, we'll assume the extractor is running ahead.
                    # A robust tail would check if extractor is done. 
                    # We'll just sleep briefly and retry a few times if we think it's still filling.
                    if total_uploaded > 0 and (time.time() - os.path.getmtime(filepath) > 60):
                        break # File hasn't changed in 60s, assume done
                    time.sleep(0.5)
                    continue
                    
                line = line.strip()
                if not line: continue
                
                try:
                    obj = json.loads(line)
                    flds = obj.get('fields', {})
                    pk = obj.get('pk')
                    
                    # Prepare row
                    row = []
                    for col in columns:
                        val = flds.get(col)
                        # Specific handling for PKs if they are not in fields
                        if col == 'zipcode_id' and not val: val = pk
                        if col == 'idx_id' and not val: val = flds.get('idx_id') # checking
                        # Basic mapping
                        row.append(val)
                        
                    writer.writerow(row)
                    count += 1
                    
                    if count >= CHUNK_SIZE:
                        csv_buffer.seek(0)
                        cur.copy_expert(f'COPY "{table}" ({cols_str}) FROM STDIN WITH (FORMAT CSV, HEADER FALSE)', csv_buffer)
                        conn.commit()
                        total_uploaded += count
                        count = 0
                        csv_buffer.close()
                        csv_buffer = io.StringIO()
                        writer = csv.writer(csv_buffer)
                        print(f"  ⚡ {table}: Uploaded {total_uploaded:,} records...", end='\r')
                        
                except json.JSONDecodeError:
                    continue
            
            # Flush
            if count > 0:
                csv_buffer.seek(0)
                cur.copy_expert(f'COPY "{table}" ({cols_str}) FROM STDIN WITH (FORMAT CSV, HEADER FALSE)', csv_buffer)
                conn.commit()
                total_uploaded += count
                
        print(f"✅ Finished {table}: {total_uploaded:,} records.")
        conn.close()
        
    except Exception as e:
        print(f"❌ Error {table}: {e}")

def universal_uploader():
    print(f"🚀 UNIVERSAL UPLOADER STARTING")
    with ThreadPoolExecutor(max_workers=5) as executor:
        for filename, config in FILES_TO_MONITOR.items():
            executor.submit(upload_worker, filename, config)

if __name__ == "__main__":
    universal_uploader()
