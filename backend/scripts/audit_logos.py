import psycopg2

# Azure Connection
DB_HOST = "junk.postgres.database.azure.com"
DB_USER = "junkyard_admin"
DB_PASSWORD = "saksaud@7411"
DB_NAME = "junkyard"

try:
    conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD, host=DB_HOST, sslmode="require")
    cur = conn.cursor()
    
    print("\n🔍 Vendor Logo Status Audit:")
    cur.execute('SELECT count(*) FROM hollander_vendor WHERE logo IS NOT NULL AND logo != \'\';')
    logo_count = cur.fetchone()[0]
    
    cur.execute('SELECT count(*) FROM hollander_vendor;')
    total_vendors = cur.fetchone()[0]
    
    print(f"Total Vendors             : {total_vendors:,}")
    print(f"Vendors with Logos/Images : {logo_count:,}")
    print(f"Vendors missing Logos     : {total_vendors - logo_count:,}")
    
    if logo_count > 0:
        print("\n📂 Sample Logos Assigned:")
        cur.execute('SELECT name, logo FROM hollander_vendor WHERE logo IS NOT NULL AND logo != \'\' LIMIT 5;')
        for name, logo in cur.fetchall():
            print(f"  - {name}: {logo}")
            
    conn.close()
except Exception as e:
    print(f"Error: {e}")
