"""
Create a test vendor user for the Vendor Portal

This script creates:
1. A vendor user account
2. Links it to an existing vendor
3. Sets up proper permissions
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.users.models import User, VendorProfile
from apps.vendors.models import Vendor

def create_test_vendor_user():
    print("Creating test vendor user...")
    
    # Check if test user already exists
    email = "vendor@test.com"
    if User.objects.filter(email=email).exists():
        print(f"User {email} already exists. Deleting and recreating...")
        User.objects.filter(email=email).delete()
    
    # Create vendor user
    user = User.objects.create_user(
        username="vendor_test",
        email=email,
        password="vendor123",  # Simple password for testing
        user_type="vendor",
        first_name="Test",
        last_name="Vendor"
    )
    print(f"✓ Created user: {user.email}")
    
    # Get the first vendor from database
    vendor = Vendor.objects.first()
    if not vendor:
        print("✗ No vendors found in database. Please add vendors first.")
        return
    
    print(f"✓ Found vendor: {vendor.name}")
    
    # Create vendor profile linking user to vendor
    vendor_profile = VendorProfile.objects.create(
        user=user,
        vendor=vendor,
        is_owner=True,
        can_edit=True,
        can_respond_reviews=True,
        can_manage_inventory=True
    )
    print(f"✓ Created vendor profile linking {user.email} to {vendor.name}")
    
    print("\n" + "="*60)
    print("TEST VENDOR USER CREATED SUCCESSFULLY!")
    print("="*60)
    print(f"Email: {email}")
    print(f"Password: vendor123")
    print(f"Vendor: {vendor.name}")
    print(f"Login URL: http://localhost:3000/vendor/login")
    print("="*60)

if __name__ == "__main__":
    create_test_vendor_user()
