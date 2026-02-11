import psycopg2
import os
import time

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

    print("\n🔍 DEEP DIVE: Azure Database Status")
    print("=" * 50)
    
    # 1. DB Size
    cur.execute("SELECT pg_size_pretty(pg_database_size('junkyard'));")
    size = cur.fetchone()[0]
    print(f"📦 Database Size: {size}")

    # 2. Long Running Transactions
    print("\n⏱️ Longest Running Transactions:")
    cur.execute("""
        SELECT pid, state, now() - xact_start as duration, query 
        FROM pg_stat_activity 
        WHERE state != 'idle' 
        ORDER BY duration DESC 
        LIMIT 3;
    """)
    rows = cur.fetchall()
    if not rows:
        print("   (No active transactions found - DB might be idle waiting for script)")
    for row in rows:
        print(f"   PID: {row[0]} | State: {row[1]} | Duration: {row[2]}")
        print(f"   Query: {row[3][:100]}...")

    # 3. Blocked Queries
    print("\n🚫 Blocked / Waiting Queries:")
    cur.execute("""
        SELECT pid, usename, query_start, state, query
        FROM pg_stat_activity
        WHERE wait_event_type = 'Lock';
    """)
    locks = cur.fetchall()
    if not locks:
        print("   (No locks detected - Good)")
    else:
        for lock in locks:
            print(f"   BLOCKED PID: {lock[0]} | Query: {lock[4][:50]}...")

    # 4. Row Counts (Dirty Read attempt)
    print("\n📊 Table Counts (Approx):")
    cur.execute("SELECT count(*) FROM hollander_index") 
    try:
        idx_count = cur.fetchone()[0]
        print(f"   hollander_index: {idx_count}")
    except:
        print("   hollander_index: <Cannot read>")

    conn.close()
    
except Exception as e:
    print(f"Connection failed: {e}")
