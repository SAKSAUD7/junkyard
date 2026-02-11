import sqlite3

# Connect to local SQLite database
conn = sqlite3.connect('db.sqlite3')
cur = conn.cursor()

print("\n📊 Local SQLite Database - All Tables Row Count:")
print("=" * 60)

# Get all tables
cur.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;")
tables = cur.fetchall()

total_rows = 0

for (table,) in tables:
    try:
        cur.execute(f'SELECT COUNT(*) FROM "{table}"')
        count = cur.fetchone()[0]
        total_rows += count
        if count > 0:
            print(f"{table:<50}: {count:>10,}")
    except Exception as e:
        print(f"{table:<50}: ERROR - {str(e)[:30]}")

print("=" * 60)
print(f"{'TOTAL RECORDS':<50}: {total_rows:>10,}")

conn.close()
