import sqlite3

# Clean up ALL vendor-related tables
conn = sqlite3.connect('db.sqlite3')
cursor = conn.cursor()

# Get all table names
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
all_tables = [row[0] for row in cursor.fetchall()]

# Filter for vendor-related tables
vendor_tables = [t for t in all_tables if 'vendor' in t.lower()]

print(f"Found {len(vendor_tables)} vendor-related tables:")
for table in vendor_tables:
    print(f"  - {table}")

# Also add other tables that might reference vendors
additional_tables = [
    'leads_lead_assigned_vendors',
    'yard_submissions_yardsubmission',
]

tables_to_clean = list(set(vendor_tables + additional_tables))

try:
    # Temporarily disable foreign key constraints
    cursor.execute("PRAGMA foreign_keys=OFF")
    
    for table in tables_to_clean:
        try:
            cursor.execute(f"DELETE FROM {table}")
            rows_deleted = cursor.rowcount
            if rows_deleted > 0:
                print(f"✅ Cleaned {table} ({rows_deleted} rows)")
        except Exception as e:
            print(f"⚠️  {table}: {e}")
    
    # Re-enable foreign key constraints
    cursor.execute("PRAGMA foreign_keys=ON")
    conn.commit()
    print("\n✅ All database cleanup complete!")
except Exception as e:
    print(f"❌ Error during cleanup: {e}")
    conn.rollback()
finally:
    conn.close()
