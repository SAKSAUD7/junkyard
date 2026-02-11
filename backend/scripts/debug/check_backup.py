import sqlite3

# Check vendors in backup
backup_conn = sqlite3.connect('db.sqlite3.bak')
backup_cursor = backup_conn.cursor()

backup_cursor.execute("SELECT COUNT(*) FROM hollander_vendor")
count = backup_cursor.fetchone()[0]
print(f"Vendors in backup: {count}")

# Get sample data
backup_cursor.execute("SELECT name, city, state FROM hollander_vendor LIMIT 5")
samples = backup_cursor.fetchall()
print("\nSample vendors from backup:")
for name, city, state in samples:
    print(f"  - {name} ({city}, {state})")

backup_conn.close()
