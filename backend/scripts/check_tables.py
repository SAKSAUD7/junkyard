import psycopg2

DB_HOST = "junk.postgres.database.azure.com"
DB_USER = "junkyard_admin"
DB_PASSWORD = "saksaud@7411"
DB_NAME = "junkyard"

try:
    conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD, host=DB_HOST, sslmode="require")
    cur = conn.cursor()
    
    cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';")
    tables = [row[0] for row in cur.fetchall()]
    
    print(f"Total Tables: {len(tables)}")
    print("Sample:", tables[:10])
    
    if 'users_user' in tables:
        print("✅ users_user exists")
    else:
        print("❌ users_user NOT FOUND")
        # Find similar
        print([t for t in tables if 'user' in t])

    conn.close()
except Exception as e:
    print(e)
