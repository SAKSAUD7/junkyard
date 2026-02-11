import psycopg2

# Azure Connection
DB_HOST = "junk.postgres.database.azure.com"
DB_USER = "junkyard_admin"
DB_PASSWORD = "saksaud@7411"
DB_NAME = "junkyard"

try:
    conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD, host=DB_HOST, sslmode="require")
    cur = conn.cursor()
    
    print("\n📋 ALL Tables in Azure (All Schemas):")
    print(f"{'SCHEMA':<15} | {'TABLE NAME':<40}")
    print("-" * 60)
    
    cur.execute("""
        SELECT table_schema, table_name 
        FROM information_schema.tables 
        WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
        ORDER BY table_schema, table_name;
    """)
    for schema, table in cur.fetchall():
        print(f"{schema:<15} | {table:<40}")
        
    conn.close()
except Exception as e:
    print(f"Error: {e}")
