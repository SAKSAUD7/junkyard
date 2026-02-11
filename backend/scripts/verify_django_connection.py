import os
import sys
import django

# Setup Django Environment
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(base_dir)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from django.db import connection
from apps.hollander.models import HollanderIndex, Vendor

try:
    print("Checking connection...")
    with connection.cursor() as cursor:
        cursor.execute("SELECT 1")
        print("✅ Database connection successful!")

    print("\nVerifying Data Access via ORM:")
    index_count = HollanderIndex.objects.count()
    vendor_count = Vendor.objects.count()
    
    print(f" - HollanderIndex Count: {index_count:,}")
    print(f" - Vendor Count: {vendor_count:,}")
    
    if index_count > 0:
        print("\n🚀 SUCCESS: Backend is reading from Azure PostgreSQL!")
    else:
        print("\n⚠️  WARNING: Connected but table appears empty? (Check migration)")

except Exception as e:
    print(f"\n❌ CONNECTION FAILED: {e}")
