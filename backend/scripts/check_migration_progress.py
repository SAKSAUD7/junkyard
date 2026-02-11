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

    print("\n🔍 Azure Database Health Check:")
    print("=" * 40)
    
    # 1. Check Active Queries (What is the DB doing right now?)
    print("running queries:")
    try:
        cur.execute("""
            SELECT pid, state, query_start, query 
            FROM pg_stat_activity 
            WHERE state != 'idle' AND pid != pg_backend_pid();
        """)
        rows = cur.fetchall()
        if not rows:
            print("  (No active queries - Database is Idle)")
        else:
            for row in rows:
                # Truncate query for display
                q = (row[3][:80] + '..') if len(row[3]) > 80 else row[3]
                print(f"  PID: {row[0]} | {row[1]} | {row[2].strftime('%H:%M:%S')} | {q}")
    except Exception as e:
        print(f"  Error checking activity: {e}")

    print("-" * 40)

    # 2. Check Row Counts (Dirty Read)
    tables = ['hollander_index', 'hollander_vendor']
    for table in tables:
        try:
            # Force dirty read for count
            cur.execute(f"SELECT count(*) FROM {table}") 
            count = cur.fetchone()[0]
            print(f"{table:<25}: {count:>10,} records")
        except:
            print(f"{table:<25}:          0")

    conn.close()

except Exception as e:
    print(f"Connection failed: {e}")
