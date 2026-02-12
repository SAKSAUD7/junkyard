"""
Verify status of Hollander reference data tables used by Lead Forms
 Checks:
 - hollander_make
 - hollander_model
 - hollander_part_type
 - hollander_zipcode
"""
import psycopg2
import sys
import os

# Azure PostgreSQL connection
DB_CONFIG = {
    'host': 'junk.postgres.database.azure.com',
    'database': 'junkyard',
    'user': 'junkyard_admin',
    'password': 'saksaud@7411',
    'port': 5432,
    'sslmode': 'require'
}

def verify_lead_data():
    print("[*] Connecting to Azure PostgreSQL...")
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()
    
    tables_to_check = [
        'hollander_make',
        'hollander_model',
        'hollander_part_type',
        'hollander_zipcode',
        'hollander_index',
        'hollander_part_pricing'
    ]
    
    print(f"\n{'TABLE':<30} | {'COUNT':<10}")
    print("-" * 45)
    
    results = {}
    
    for table in tables_to_check:
        try:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]
            results[table] = count
            print(f"{table:<30} | {count:<10,}")
        except Exception as e:
            print(f"{table:<30} | ERROR: {e}")
            results[table] = 0
            
    print("-" * 45)
    
    # Validation logic
    missing = []
    if results.get('hollander_make', 0) < 10: missing.append('hollander_make')
    if results.get('hollander_model', 0) < 100: missing.append('hollander_model')
    if results.get('hollander_part_type', 0) < 10: missing.append('hollander_part_type')
    
    if missing:
        print(f"\n❌ CRITICAL MISSING DATA: {', '.join(missing)}")
        return 1
    else:
        print("\n✅ Lead form reference data appears populated.")
        return 0

if __name__ == "__main__":
    try:
        sys.exit(verify_lead_data())
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
