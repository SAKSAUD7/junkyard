import sqlite3
import os

db_path = os.path.join('backend', 'db.sqlite3')

try:
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    tables = ['hollander_yard_make', 'hollander_yard_part']
    
    print("\n🔍 SQLite Linkage Check:")
    for table in tables:
        try:
            cur.execute(f'SELECT count(*) FROM "{table}"')
            count = cur.fetchone()[0]
            print(f"{table:<25}: {count:,} rows")
            
            # Sample data to check for corruption
            if count > 0:
                cur.execute(f'SELECT * FROM "{table}" LIMIT 3')
                print(f"   Sample: {cur.fetchall()}")
        except Exception as e:
            print(f"{table:<25}: ERROR - {e}")
            
    conn.close()
except Exception as e:
    print(f"Error: {e}")
