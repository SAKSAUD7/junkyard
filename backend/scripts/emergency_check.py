import psycopg2

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
    cur = conn.cursor()

    print("\n🔍 Critical Tables Check:")
    print("=" * 60)
    
    # Check key tables
    tables_to_check = [
        ('hollander', 'hollander_vendor'),
        ('hollander', 'hollander_hollanderindex'),
        ('hollander', 'hollander_partpricing'),
        ('hollander', 'hollander_profilevisit'),
        ('hollander', 'hollander_zipcode'),
        ('public', 'hollander_vendor'),
        ('public', 'hollander_hollanderindex'),
    ]
    
    for schema, table in tables_to_check:
        try:
            cur.execute(f'SELECT COUNT(*) FROM "{schema}"."{table}"')
            count = cur.fetchone()[0]
            print(f"{schema}.{table:<40}: {count:>10,}")
        except Exception as e:
            print(f"{schema}.{table:<40}: NOT FOUND")
    
    print("\n📋 All Tables in Database:")
    print("=" * 60)
    cur.execute("""
        SELECT schemaname, tablename 
        FROM pg_tables 
        WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
        ORDER BY schemaname, tablename
        LIMIT 50;
    """)
    
    for schema, table in cur.fetchall():
        cur.execute(f'SELECT COUNT(*) FROM "{schema}"."{table}"')
        count = cur.fetchone()[0]
        if count > 0:
            print(f"{schema}.{table:<40}: {count:>10,}")
    
    conn.close()

except Exception as e:
    print(f"❌ Connection failed: {e}")
