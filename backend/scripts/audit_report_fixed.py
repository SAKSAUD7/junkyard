import psycopg2

# Azure Connection
DB_HOST = "junk.postgres.database.azure.com"
DB_USER = "junkyard_admin"
DB_PASSWORD = "saksaud@7411"
DB_NAME = "junkyard"

output_file = "azure_audit_report.txt"

try:
    conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD, host=DB_HOST, sslmode="require")
    cur = conn.cursor()
    
    cur.execute("""
        SELECT table_schema, table_name 
        FROM information_schema.tables 
        WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
        ORDER BY table_schema, table_name;
    """)
    tables = cur.fetchall()
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("📊 Azure Table Audit Report\n")
        f.write("-" * 50 + "\n")
        f.write(f"{'Schema':<15} | {'Table Name':<35} | {'Count':>12}\n")
        f.write("-" * 70 + "\n")
        
        for schema, table in tables:
            try:
                cur.execute(f'SELECT count(*) FROM "{schema}"."{table}"')
                count = cur.fetchone()[0]
                f.write(f"{schema:<15} | {table:<35} | {count:>12,}\n")
            except Exception as e:
                f.write(f"{schema:<15} | {table:<35} | ERROR\n")
                conn.rollback()
                
    print(f"Report written to {output_file}")
    conn.close()
except Exception as e:
    print(f"Error: {e}")
