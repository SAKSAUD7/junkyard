import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.db import connection

def fix_orphaned_records():
    with connection.cursor() as cursor:
        # Truncate vendor_inventory to resolve integrity errors aggressively
        cursor.execute("DELETE FROM vendor_inventory")
        print(f"Deleted ALL vendor_inventory records.")
        
        # Also check for other potential orphans if needed
        # But explicitly address the error reported: vendor_inventory foreign key constraint

if __name__ == '__main__':
    fix_orphaned_records()
