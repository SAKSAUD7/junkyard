import os
import django
import sys

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.users.models import User, VendorProfile
from apps.hollander.models import Vendor

email = "hidsonphoto67223@gmail.com"

try:
    user = User.objects.get(email=email)
    print(f"User found: {user.username} (ID: {user.id})")
    
    try:
        profile = user.vendor_profile
        print(f"VendorProfile found: ID {profile.id}")
        print(f"Linked Vendor: {profile.vendor.name} (ID: {profile.vendor.id})")
    except Exception as e:
        print(f"No VendorProfile found for user. Error: {e}")
        
        # Check if we can find a vendor with this email to maybe link it
        vendor = Vendor.objects.filter(email=email).first()
        if vendor:
            print(f"Found vendor with matching email: {vendor.name} (ID: {vendor.id})")
        else:
            print("No vendor found with matching email.")

except User.DoesNotExist:
    print(f"User with email {email} not found.")
