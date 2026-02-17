
import os
import sys
import django
from dotenv import load_dotenv

# Setup Django Environment
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
sys.path.append(backend_dir)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
load_dotenv(os.path.join(backend_dir, '.env'))
django.setup()

from apps.hollander.models import Vendor

def verify_updates():
    print("[*] Verifying Vendor Logo Updates...")
    
    vendors_with_azure = Vendor.objects.filter(logo__icontains="junkyardstoragedev.blob.core.windows.net/media/vendor_logos/")
    count = vendors_with_azure.count()
    
    print(f"   Vendors with Azure URLs: {count}")
    
    if count > 0:
        sample = vendors_with_azure.first()
        print(f"   Sample: {sample.name} -> {sample.logo}")
    else:
        print("   [WARNING] No vendors found with updated Azure URLs yet.")

if __name__ == "__main__":
    verify_updates()
