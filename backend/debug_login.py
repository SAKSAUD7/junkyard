
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.users.models import User
from django.contrib.auth import authenticate

email = 'vendor@example.com'
password = 'VendorPass123!'

print(f"Checking user {email}...")

user = User.objects.filter(email=email).first()

if not user:
    print("User NOT FOUND. Creating...")
    # Fix: Ensure username is provided if required
    user = User.objects.create_user(
        username=email,
        email=email,
        password=password,
        first_name='Test',
        last_name='Vendor',
        user_type='vendor'
    )
    print("User created.")
else:
    print(f"User found. ID: {user.id}")
    print(f"User Type: {user.user_type}")
    print(f"Is Active: {user.is_active}")
    print(f"Has Usable Password: {user.has_usable_password()}")
    
    # Reset password to be sure
    print("Resetting password...")
    user.set_password(password)
    user.save()
    print("Password reset.")

# Verify authentication
print("Verifying authentication...")
auth_user = authenticate(username=email, password=password)
if auth_user:
    print("SUCCESS: Authentication verification passed!")
else:
    print("FAILURE: verify_user script could not authenticate even after reset.")
    # Check if backend uses email or username for auth
    print("Checking backend authentication backend...")
    from django.conf import settings
    print(f"Auth Backends: {settings.AUTHENTICATION_BACKENDS}")

