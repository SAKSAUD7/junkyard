import psycopg2

# Azure Connection
DB_HOST = "junk.postgres.database.azure.com"
DB_USER = "junkyard_admin"
DB_PASSWORD = "saksaud@7411"
DB_NAME = "junkyard"

try:
    conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD, host=DB_HOST, sslmode="require")
    cur = conn.cursor()
    
    print("\n🔍 hollander_part_pricing sample:")
    cur.execute('SELECT * FROM "hollander_part_pricing" LIMIT 3')
    cols = [desc[0] for desc in cur.description]
    print(f"Columns: {cols}")
    for row in cur.fetchall():
        print(row)
        
    conn.close()
except Exception as e:
    print(f"Error: {e}")
