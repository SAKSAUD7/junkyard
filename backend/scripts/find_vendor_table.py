import sqlite3
import os

db_path = os.path.join('backend', 'db.sqlite3')

try:
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    print("\n📋 SQLite Table Row Counts:")
    print("=" * 60)
    
    cur.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;")
    tables = [t[0] for t in cur.fetchall()]
    
    for table in tables:
        try:
            cur.execute(f'SELECT count(*) FROM "{table}"')
            count = cur.fetchone()[0]
            if count > 0:
                print(f"{table:<40}: {count:>10,}")
                # Check if it looks like vendor data
                if 5000 < count < 7000:
                    print(f"   [?] Potential Vendor Table? ({count})")
        except Exception as e:
            print(f"{table:<40}: ERROR")

    conn.close()
except Exception as e:
    print(f"Error: {e}")
