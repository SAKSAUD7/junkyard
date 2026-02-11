import sqlite3
import os

db_path = os.path.join('backend', 'db.sqlite3')

try:
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    table = 'hollander_profile_visit'
    
    print("\n🔍 SQLite ProfileVisit Check:")
    try:
        cur.execute(f'SELECT count(*) FROM "{table}"')
        count = cur.fetchone()[0]
        print(f"{table:<25}: {count:,} rows")
        
        if count > 0:
            cur.execute(f'SELECT * FROM "{table}" LIMIT 3')
            cols = [desc[0] for desc in cur.description]
            print(f"   Columns: {cols}")
            print(f"   Sample: {cur.fetchall()}")
    except Exception as e:
        print(f"{table:<25}: ERROR - {e}")
            
    conn.close()
except Exception as e:
    print(f"Error: {e}")
