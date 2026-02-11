import psycopg2

# Azure Connection
DB_HOST = "junk.postgres.database.azure.com"
DB_USER = "junkyard_admin"
DB_PASSWORD = "saksaud@7411"
DB_NAME = "junkyard"

try:
    conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD, host=DB_HOST, sslmode="require")
    cur = conn.cursor()
    
    print("\n📋 Hollander Tables in Azure:")
    cur.execute("""
        SELECT table_schema, table_name 
        FROM information_schema.tables 
        WHERE table_name LIKE 'hollander%'
        ORDER BY table_schema, table_name;
    """)
    for schema, table in cur.fetchall():
        full_name = f"{schema}.{table}"
        print(f"{full_name:<50}")
        
    conn.close()
except Exception as e:
    print(f"Error: {e}")
