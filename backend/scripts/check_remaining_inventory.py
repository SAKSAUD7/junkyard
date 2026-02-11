import psycopg2

# Azure Connection
DB_HOST = "junk.postgres.database.azure.com"
DB_USER = "junkyard_admin"
DB_PASSWORD = "saksaud@7411"
DB_NAME = "junkyard"

try:
    conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD, host=DB_HOST, sslmode="require")
    cur = conn.cursor()
    
    # Tables to check based on inventory
    tables = [
        'hollander_hollanderindex',
        'hollander_zipcode',
        'hollander_make',
        'hollander_model',
        'hollander_part_type',
        'hollander_vendor', # Already done, check anyway
        'hollander_legacy_account',
        'hollander_legacy_user',
        'users_user',
        'hollander_profile_visit',
        'hollander_interchange',
        'hollander_yard_make'
    ]
    
    print("\n🔍 Live Azure Row Counts vs Inventory:")
    print(f"{'Table':<30} | {'Azure Count':<15}")
    print("-" * 50)
    
    for table in tables:
        try:
            cur.execute(f"SELECT count(*) FROM {table};")
            count = cur.fetchone()[0]
            print(f"{table:<30} | {count:,.0f}")
        except Exception as e:
            print(f"{table:<30} | ❌ (Error/Missing)")
            conn.rollback()
            
    conn.close()
except Exception as e:
    print(f"Connection Error: {e}")
