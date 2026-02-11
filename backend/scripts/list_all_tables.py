import psycopg2
import os

DB_HOST = "junk.postgres.database.azure.com"
DB_USER = "junkyard_admin"
DB_PASSWORD = "saksaud@7411"
DB_NAME = "junkyard"

try:
    conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD, host=DB_HOST, sslmode="require")
    cur = conn.cursor()
    
    cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;")
    tables = [row[0] for row in cur.fetchall()]
    
    print(f"Total Tables: {len(tables)}")
    with open('backend/pg_tables.txt', 'w') as f:
        for t in tables:
            f.write(t + '\n')
    print(f"Wrote {len(tables)} tables to backend/pg_tables.txt")
        
    conn.close()
except Exception as e:
    print(e)
