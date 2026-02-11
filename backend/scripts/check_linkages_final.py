import psycopg2

# Azure Connection
DB_HOST = "junk.postgres.database.azure.com"
DB_USER = "junkyard_admin"
DB_PASSWORD = "saksaud@7411"
DB_NAME = "junkyard"

try:
    conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD, host=DB_HOST, sslmode="require")
    cur = conn.cursor()
    
    tables_to_check = [
        'hollander_yard_make',
        'hollander_yard_part',
        'hollander_year_range',
        'hollander_interchange',
        'hollander_part_pricing'
    ]
    
    print("\n🔍 Linkage Table Audit:")
    for table in tables_to_check:
        cur.execute(f'SELECT count(*) FROM "{table}"')
        count = cur.fetchone()[0]
        print(f"{table:<30}: {count:,} rows")
            
    conn.close()
except Exception as e:
    print(f"Error: {e}")
