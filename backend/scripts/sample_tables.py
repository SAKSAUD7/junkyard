import psycopg2

# Azure Connection
DB_HOST = "junk.postgres.database.azure.com"
DB_USER = "junkyard_admin"
DB_PASSWORD = "saksaud@7411"
DB_NAME = "junkyard"

try:
    conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD, host=DB_HOST, sslmode="require")
    cur = conn.cursor()
    
    # Check content of hollander_vendor
    print("\n🔍 hollander_vendor sample:")
    cur.execute('SELECT * FROM "hollander_vendor" LIMIT 3')
    cols = [desc[0] for desc in cur.description]
    print(f"Columns: {cols}")
    for row in cur.fetchall():
        print(row)

    # Check content of hollander_index
    print("\n🔍 hollander_index sample:")
    cur.execute('SELECT * FROM "hollander_index" LIMIT 3')
    cols = [desc[0] for desc in cur.description]
    print(f"Columns: {cols}")
    for row in cur.fetchall():
        print(row)
        
    conn.close()
except Exception as e:
    print(f"Error: {e}")
