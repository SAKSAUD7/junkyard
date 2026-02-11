import psycopg2

# Azure Connection
DB_HOST = "junk.postgres.database.azure.com"
DB_USER = "junkyard_admin"
DB_PASSWORD = "saksaud@7411"
DB_NAME = "junkyard"

try:
    conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD, host=DB_HOST, sslmode="require")
    cur = conn.cursor()
    
    tables = [
        'hollander_yard_make',
        'hollander_yard_part',
        'hollander_vendor',
        'hollander_part_pricing'
    ]
    
    print("\n🔍 Live Table Status (Azure):")
    for table in tables:
        cur.execute(f'SELECT count(*) FROM "{table}"')
        count = cur.fetchone()[0]
        print(f"{table:<25}: {count:,} rows")
            
    conn.close()
except Exception as e:
    print(f"Error: {e}")
