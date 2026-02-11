import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import os

# Azure Connection Details
DB_HOST = "junk.postgres.database.azure.com"
DB_USER = "junkyard_admin"
DB_PASSWORD = "saksaud@7411"
DB_PORT = "5432"

try:
    # Connect to default 'postgres' database
    conn = psycopg2.connect(
        dbname="postgres",
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT,
        sslmode="require"
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cur = conn.cursor()
    
    # Check if database exists
    cur.execute("SELECT 1 FROM pg_database WHERE datname = 'junkyard'")
    exists = cur.fetchone()
    
    if not exists:
        print("Creating database 'junkyard'...")
        cur.execute("CREATE DATABASE junkyard")
        print("Database created successfully!")
    else:
        print("Database 'junkyard' already exists.")
        
    cur.close()
    conn.close()
    
except Exception as e:
    print(f"Error: {e}")
