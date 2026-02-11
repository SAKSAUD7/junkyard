import psycopg2

# Azure Connection
DB_HOST = "junk.postgres.database.azure.com"
DB_USER = "junkyard_admin"
DB_PASSWORD = "saksaud@7411"
DB_NAME = "junkyard"

try:
    conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD, host=DB_HOST, sslmode="require")
    cur = conn.cursor()
    
    cur.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
    """)
    tables = [t[0] for t in cur.fetchall()]
    
    print("\n📊 Azure Public Schema Table Audit:")
    print(f"{'Table Name':<35} | {'Row Count':>12}")
    print("-" * 50)
    
    total_rows = 0
    for table in tables:
        try:
            cur.execute(f'SELECT count(*) FROM "{table}"')
            count = cur.fetchone()[0]
            print(f"{table:<35} | {count:>12,}")
            total_rows += count
        except Exception as e:
            print(f"{table:<35} | ERROR - {e}")
            conn.rollback()
            
    print("-" * 50)
    print(f"{'TOTAL':<35} | {total_rows:>12,}")
    
    conn.close()
except Exception as e:
    print(f"Connection failed: {e}")
