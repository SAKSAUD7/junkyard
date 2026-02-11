
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.users.models import User, VendorProfile
from apps.hollander.models import Vendor

def create_vendor_user():
    email = 'vendor@example.com'
    password = 'VendorPass123!'
    
    # Check if user exists
    user = User.objects.filter(email=email).first()
    
    if user:
        print(f"User {email} already exists. Updating password...")
        user.set_password(password)
        user.user_type = 'vendor'
        user.save()
    else:
        print(f"Creating user {email}...")
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name='Test',
            last_name='Vendor',
            user_type='vendor'
        )

    # Ensure Vendor Profile exists
    vendor_profile, created = VendorProfile.objects.get_or_create(user=user)
    
    # Ensure linked Hollander Vendor exists (needed for some logic)
    if not vendor_profile.vendor:
        print("Creating dummy Hollander vendor...")
        vendor, _ = Vendor.objects.get_or_create(
            name="Test Vendor Inc",
            defaults={'slug': 'test-vendor-inc', 'is_active': True}
        )
        vendor_profile.vendor = vendor
        vendor_profile.save()
        
    print(f"SUCCESS: Vendor user ready.")
    print(f"Email: {email}")
    print(f"Password: {password}")

if __name__ == '__main__':
    create_vendor_user()
