import os
import django
import sys
# Set up django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()
vendor = User.objects.filter(email='info@111salvage.com').first()
if vendor:
    print(f"Vendor found! Username: {vendor.username}, Active: {vendor.is_active}")
else:
    print("Vendor NOT found in local db.")
