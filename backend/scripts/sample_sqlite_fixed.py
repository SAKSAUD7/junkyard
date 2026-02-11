import sqlite3
import os

db_path = os.path.join('backend', 'db.sqlite3')
print(f"Connecting to: {db_path}")

try:
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    print("\n🔍 SQLite hollander_vendor sample:")
    cur.execute('SELECT * FROM hollander_vendor LIMIT 3')
    cols = [desc[0] for desc in cur.description]
    print(f"Columns: {cols}")
    for row in cur.fetchall():
        print(row)
        
    print("\n🔍 SQLite hollander_index sample:")
    cur.execute('SELECT * FROM hollander_index LIMIT 3')
    cols = [desc[0] for desc in cur.description]
    print(f"Columns: {cols}")
    for row in cur.fetchall():
        print(row)

    conn.close()
except Exception as e:
    print(f"Error: {e}")
