import psycopg2

# Azure Connection
DB_HOST = "junk.postgres.database.azure.com"
DB_USER = "junkyard_admin"
DB_PASSWORD = "saksaud@7411"
DB_NAME = "junkyard"

try:
    conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD, host=DB_HOST, sslmode="require")
    cur = conn.cursor()
    
    tables = ['hollander_yard_make', 'hollander_yard_part', 'hollander_part_pricing']
    
    print("\n🔍 Foreign Key Constraints Audit:")
    print("-" * 60)
    for table in tables:
        print(f"\nTable: {table}")
        cur.execute("""
            SELECT
                conname AS constraint_name,
                pg_get_constraintdef(c.oid) AS constraint_definition
            FROM pg_constraint c
            JOIN pg_namespace n ON n.oid = c.connamespace
            WHERE conrelid = %s::regclass;
        """, (table,))
        constraints = cur.fetchall()
        for con_name, con_def in constraints:
            print(f"  {con_name}: {con_def}")
            
    conn.close()
except Exception as e:
    print(f"Error: {e}")
