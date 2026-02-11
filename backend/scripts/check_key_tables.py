import psycopg2

# Azure Connection
DB_HOST = "junk.postgres.database.azure.com"
DB_USER = "junkyard_admin"
DB_PASSWORD = "saksaud@7411"
DB_NAME = "junkyard"

try:
    conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD, host=DB_HOST, sslmode="require")
    cur = conn.cursor()
    
    print("\n🔍 Checking Specific Tables:")
    print("=" * 60)
    
    tables_to_check = [
        'hollander_index', 
        'hollander_vendor', 
        'hollander_zipcode',
        'hollander_make',
        'hollander_model',
        'hollander_part_type'
    ]
    
    for t in tables_to_check:
        try:
            cur.execute(f'SELECT count(*) FROM "{t}"') # Assume public schema or search_path
            count = cur.fetchone()[0]
            print(f"{t:<30}: {count:>10,}")
        except Exception as e:
            print(f"{t:<30}: ERROR - {e}")
            conn.rollback() # Reset transaction if error

    print("\n📋 Schemas:")
    cur.execute("SELECT schema_name FROM information_schema.schemata;")
    for row in cur.fetchall():
        print(f" - {row[0]}")
            
    conn.close()

except Exception as e:
    print(f"❌ Connection failed: {e}")
