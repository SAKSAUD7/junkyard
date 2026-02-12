"""
Increase logo field length to accommodate Azure Blob Storage URLs
"""
import psycopg2
import sys
import io

# Fix encoding for Windows console
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# Database connection
DB_CONFIG = {
    'host': 'junk.postgres.database.azure.com',
    'database': 'junkyard',
    'user': 'junkyard_admin',
    'password': 'saksaud@7411',
    'port': 5432,
    'sslmode': 'require'
}

def fix_logo_field():
    try:
        print("[*] Connecting to Azure PostgreSQL...")
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        print("[OK] Connected successfully!")
        
        # Increase logo field length
        print("\n[*] Increasing logo field length to varchar(500)...")
        cursor.execute("""
            ALTER TABLE hollander_vendor 
            ALTER COLUMN logo TYPE varchar(500);
        """)
        conn.commit()
        print("[OK] Logo field length increased to varchar(500)")
        
        cursor.close()
        conn.close()
        
        print("\n[SUCCESS] Database schema updated!")
        return True
        
    except Exception as e:
        print(f"[ERROR] {e}")
        return False

if __name__ == "__main__":
    fix_logo_field()
