import psycopg2
import os

DB_HOST = "junk.postgres.database.azure.com"
DB_USER = "junkyard_admin"
DB_PASSWORD = "saksaud@7411"
DB_NAME = "junkyard"

try:
    conn = psycopg2.connect(
        dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD, host=DB_HOST, port="5432", sslmode="require"
    )
    cur = conn.cursor()
    
    cur.execute("SELECT count(*) FROM pg_stat_activity WHERE state = 'active';")
    active_count = cur.fetchone()[0]
    
    cur.execute("SELECT pg_size_pretty(pg_database_size('junkyard'));")
    db_size = cur.fetchone()[0]
    
    print(f"Active Queries: {active_count}")
    print(f"DB Size: {db_size}")
    
    conn.close()
except Exception as e:
    print(f"Error: {e}")
