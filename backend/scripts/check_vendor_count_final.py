import psycopg2

# Azure Connection
DB_HOST = "junk.postgres.database.azure.com"
DB_USER = "junkyard_admin"
DB_PASSWORD = "saksaud@7411"
DB_NAME = "junkyard"

try:
    conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD, host=DB_HOST, sslmode="require")
    cur = conn.cursor()
    cur.execute('SELECT count(*) FROM "hollander_vendor"')
    count = cur.fetchone()[0]
    print(f"hollander_vendor count: {count:,}")
    conn.close()
except Exception as e:
    print(f"Error: {e}")
