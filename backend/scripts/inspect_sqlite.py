
import sqlite3
import os

db_path = "db.sqlite3"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Check tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%vendor%';")
tables = cursor.fetchall()
print(f"Tables: {tables}")

# Check content of a likely table
table = 'hollander_vendor'
try:
    cursor.execute(f"SELECT id, logo FROM {table} WHERE logo IS NOT NULL AND logo != '' LIMIT 5")
    rows = cursor.fetchall()
    print(f"\nSample Data from {table}:")
    for r in rows:
        print(r)
        
    # Check count of matches
    cursor.execute(f"SELECT count(*) FROM {table} WHERE logo LIKE '%vendor_logos/%'")
    count = cursor.fetchone()[0]
    print(f"\nMatches for '%vendor_logos/%': {count}")
    
except Exception as e:
    print(f"Error reading {table}: {e}")

conn.close()
