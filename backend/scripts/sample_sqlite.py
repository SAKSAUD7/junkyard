import sqlite3

conn = sqlite3.connect('db.sqlite3')
cur = conn.cursor()

print("\n🔍 SQLite hollander_vendor sample:")
try:
    cur.execute('SELECT * FROM hollander_vendor LIMIT 3')
    cols = [desc[0] for desc in cur.description]
    print(f"Columns: {cols}")
    for row in cur.fetchall():
        print(row)
        
    cur.execute('SELECT count(*) FROM hollander_vendor')
    print(f"Count: {cur.fetchone()[0]}")
    
except Exception as e:
    print(f"Error: {e}")

print("\n🔍 SQLite hollander_index sample:")
try:
    cur.execute('SELECT * FROM hollander_index LIMIT 3')
    cols = [desc[0] for desc in cur.description]
    print(f"Columns: {cols}")
    for row in cur.fetchall():
        print(row)

    cur.execute('SELECT count(*) FROM hollander_index')
    print(f"Count: {cur.fetchone()[0]}")

except Exception as e:
    print(f"Error: {e}")

conn.close()
