import psycopg2
import os

# Azure Connection (Credentials from context)
DB_HOST = "junk.postgres.database.azure.com"
DB_USER = "junkyard_admin"
DB_PASSWORD = "saksaud@7411"
DB_NAME = "junkyard"

try:
    conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD, host=DB_HOST, sslmode="require")
    cur = conn.cursor()
    
    # Check all key tables
    tables = [
        'hollander_vendor', 
        'hollander_part_pricing', 
        'hollander_index', 
        'hollander_profile_visit',
        'hollander_zipcode'
    ]
    
    print("\n📊 Current Database Status (Azure):")
    print("-" * 50)
    for table in tables:
        try:
            cur.execute(f'SELECT count(*) FROM "{table}"')
            count = cur.fetchone()[0]
            print(f"{table:<30}: {count:,} rows")
        except Exception as e:
            print(f"{table:<30}: ERROR - {e}")
            conn.rollback()
            
    conn.close()
except Exception as e:
    print(f"Connection failed: {e}")
