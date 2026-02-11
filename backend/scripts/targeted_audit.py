import psycopg2

# Azure Connection
DB_HOST = "junk.postgres.database.azure.com"
DB_USER = "junkyard_admin"
DB_PASSWORD = "saksaud@7411"
DB_NAME = "junkyard"

try:
    conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD, host=DB_HOST, sslmode="require")
    cur = conn.cursor()
    
    # Get all tables that might be relevant
    cur.execute("""
        SELECT table_schema, table_name 
        FROM information_schema.tables 
        WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
        AND (table_name LIKE 'hollander_%' OR table_name LIKE 'vendors_%' OR table_name LIKE 'apps_%')
        ORDER BY table_schema, table_name;
    """)
    tables = cur.fetchall()
    
    print("\n🔍 Targeted Table Audit (Hollander & Vendors):")
    print(f"{'Schema':<15} | {'Table Name':<35} | {'Count':>12}")
    print("-" * 70)
    
    for schema, table in tables:
        try:
            cur.execute(f'SELECT count(*) FROM "{schema}"."{table}"')
            count = cur.fetchone()[0]
            print(f"{schema:<15} | {table:<35} | {count:>12,}")
        except Exception as e:
            print(f"{schema:<15} | {table:<35} | ERROR")
            conn.rollback()
            
    conn.close()
except Exception as e:
    print(f"Connection failed: {e}")
