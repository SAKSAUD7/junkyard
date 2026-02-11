import psycopg2
import os

# Azure Connection Details
DB_HOST = "junk.postgres.database.azure.com"
DB_USER = "junkyard_admin"
DB_PASSWORD = "saksaud@7411"
DB_NAME = "junkyard"
DB_PORT = "5432"

try:
    conn = psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT,
        sslmode="require"
    )
    conn.set_isolation_level(psycopg2.extensions.ISOLATION_LEVEL_AUTOCOMMIT)
    cur = conn.cursor()

    print("\n📊 Azure Database - All Tables Row Count:")
    print("=" * 60)
    
    # Get all tables
    cur.execute("""
        SELECT table_schema, table_name 
        FROM information_schema.tables 
        WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
        ORDER BY table_schema, table_name;
    """)
    
    tables = cur.fetchall()
    total_rows = 0
    
    for schema, table in tables:
        full_table_name = f"{schema}.{table}"
        try:
            cur.execute(f'SELECT COUNT(*) FROM "{schema}"."{table}"')
            count = cur.fetchone()[0]
            total_rows += count
            if count > 0:
                print(f"{full_table_name:<50}: {count:>10,}")
        except Exception as e:
            print(f"{full_table_name:<50}: ERROR - {str(e)[:30]}")
    
    print("=" * 60)
    print(f"{'TOTAL RECORDS':<50}: {total_rows:>10,}")
    
    conn.close()

except Exception as e:
    print(f"Connection failed: {e}")
