import sqlite3
import os

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
db_path = os.path.join(base_dir, 'db.sqlite3')

conn = sqlite3.connect(db_path)
cur = conn.cursor()
cur.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = [r[0] for r in cur.fetchall()]
with open('backend/sqlite_tables.txt', 'w') as f:
    for t in tables:
        f.write(t + '\n')
print(f"Wrote {len(tables)} tables to backend/sqlite_tables.txt")
conn.close()
