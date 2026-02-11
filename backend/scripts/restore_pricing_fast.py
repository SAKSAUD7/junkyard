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

pricing_json = os.path.join('backend', 'pricing_recovered.json')

def restore_pricing_fast():
    print(f"🚀 Starting FAST Pricing Restoration: {datetime.now()}")
    
    if not os.path.exists(pricing_json):
        print(f"❌ Error: {pricing_json} not found.")
        return

    try:
        conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD, host=DB_HOST, sslmode="require")
        cur = conn.cursor()
        
        # 1. Truncate Table
        print("🧹 Truncating hollander_part_pricing...")
        cur.execute('TRUNCATE TABLE "hollander_part_pricing" CASCADE;')
        conn.commit()
        
        # 2. Get columns from target table
        cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'hollander_part_pricing' AND table_schema = 'public' ORDER BY ordinal_position")
        columns = [row[0] for row in cur.fetchall() if row[0] not in ['id', 'created_at', 'updated_at']] # Skip auto fields
        cols_str = ', '.join([f'"{c}"' for c in columns])
        
        # 3. Load JSON and stream to COPY
        print(f"📖 Reading {pricing_json}...")
        with open(pricing_json, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        print(f"📦 Transferring {len(data):,} records to Azure...")
        
        csv_buffer = io.StringIO()
        writer = csv.writer(csv_buffer)
        
        # Header-less CSV: ensure fields match the 'columns' list order
        # Fields in Hollander.PartPricing (from models.py):
        # hollander_number, make, model, part_name, year_start, year_end, 
        # make_ref_id, model_ref_id, part_type_ref_id, vendor_id, 
        # new_price, wow_price, cts_price, 
        # option1..11
        
        # We need to map JSON fields (from fields: {}) to DB columns
        for item in data:
            f = item['fields']
            row = [
                f.get('hollander_number', ''),
                f.get('make', ''),
                f.get('model', ''),
                f.get('part_name', ''),
                f.get('year_start', 0),
                f.get('year_end', 0),
                f.get('make_ref', None),
                f.get('model_ref', None),
                f.get('part_type_ref', None),
                f.get('vendor', None),
                f.get('new_price', None),
                f.get('wow_price', None),
                f.get('cts_price', None),
                f.get('option1', ''),
                f.get('option2', ''),
                f.get('option3', ''),
                f.get('option4', ''),
                f.get('option5', ''),
                f.get('option6', ''),
                f.get('option7', ''),
                f.get('option8', ''),
                f.get('option9', ''),
                f.get('option10', ''),
                f.get('option11', '')
            ]
            writer.writerow(row)
        
        csv_buffer.seek(0)
        
        # Crucial: Define the column order explicitly in COPY
        sql = f'COPY "hollander_part_pricing" ({cols_str}) FROM STDIN WITH (FORMAT CSV, HEADER FALSE)'
        cur.copy_expert(sql, csv_buffer)
        
        conn.commit()
        print(f"✅ Successfully restored {len(data):,} pricing records.")
        conn.close()
        
    except Exception as e:
        print(f"❌ Error during restoration: {e}")

if __name__ == "__main__":
    restore_pricing_fast()
