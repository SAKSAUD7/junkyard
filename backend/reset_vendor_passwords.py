import os
import django
import sys

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.users.models import User, VendorProfile

print("--- RESETTING VENDOR PASSWORDS ---")
dataset = []

profiles = VendorProfile.objects.select_related('user', 'vendor').all()

for profile in profiles:
    user = profile.user
    vendor = profile.vendor
    
    # Reset password
    new_password = "password123"
    user.set_password(new_password)
    user.save()
    
    print(f"Vendor: {vendor.name}")
    print(f"Username: {user.username}")
    print(f"Email: {user.email}")
    print(f"New Password: {new_password}")
    print("-" * 30)
    
print("--- DONE ---")
