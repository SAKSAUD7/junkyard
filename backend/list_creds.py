import os
import django
import sys

sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.users.models import User, VendorProfile

with open('vendor_creds.txt', 'w') as f:
    profiles = VendorProfile.objects.select_related('user', 'vendor').all()
    for profile in profiles:
        f.write(f"Vendor: {profile.vendor.name}\n")
        f.write(f"Username: {profile.user.username}\n")
        f.write(f"Email: {profile.user.email}\n")
        f.write("-" * 30 + "\n")
print("Done writing to vendor_creds.txt")
