import os
import psycopg2
import django
from django.core.management import call_command
import sys

# Setup Django Environment
sys.path.append(os.path.join(os.getcwd(), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

# Azure Connection for Truncate
DB_HOST = "junk.postgres.database.azure.com"
DB_USER = "junkyard_admin"
DB_PASSWORD = "saksaud@7411"
DB_NAME = "junkyard"

def restore_vendors():
    print("🚀 Starting Vendor Restoration...")
    
    # 1. Truncate Table
    print("🧹 Truncating hollander_vendor on Azure...")
    try:
        conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD, host=DB_HOST, sslmode="require")
        cur = conn.cursor()
        # Cascade to clear any bad relationships
        cur.execute('TRUNCATE TABLE "hollander_vendor" CASCADE;')
        conn.commit()
        conn.close()
        print("✅ Truncated successfully.")
    except Exception as e:
        print(f"❌ Truncate failed: {e}")
        return

    # 2. Load Data
    json_path = os.path.join('backend', 'vendors_recovered.json')
    if not os.path.exists(json_path):
        print(f"❌ File not found: {json_path}")
        return
        
    print(f"📥 Loading data from {json_path}...")
    try:
        call_command('loaddata', json_path)
        print("✅ loaddata completed.")
    except Exception as e:
        print(f"❌ loaddata failed: {e}")

if __name__ == "__main__":
    restore_vendors()
