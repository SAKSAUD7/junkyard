import sqlite3
import os

db_path = os.path.join('backend', 'db.sqlite3')

try:
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    print("\n📋 Potential Vendor Tables (1000-10000 rows):")
    print("=" * 60)
    
    cur.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;")
    tables = [t[0] for t in cur.fetchall()]
    
    found = False
    for table in tables:
        try:
            cur.execute(f'SELECT count(*) FROM "{table}"')
            count = cur.fetchone()[0]
            if 1000 <= count <= 10000:
                print(f"{table:<40}: {count:>10,}")
                found = True
        except Exception as e:
            pass # Ignore errors

    if not found:
        print("❌ No tables found in range 1000-10000 records.")

    conn.close()
except Exception as e:
    print(f"Error: {e}")
