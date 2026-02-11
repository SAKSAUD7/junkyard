#!/usr/bin/env python
"""
Script to create a Django superuser for admin access.
Run this once after deployment: python create_superuser.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Check if superuser already exists
if not User.objects.filter(is_superuser=True).exists():
    User.objects.create_superuser(
        username='admin',
        email='admin@junkyard.com',
        password='Admin@123',
        first_name='Admin',
        last_name='User'
    )
    print("✅ Superuser created successfully!")
    print("Email: admin@junkyard.com")
    print("Password: Admin@123")
    print("\n⚠️  IMPORTANT: Change this password immediately after first login!")
else:
    print("ℹ️  Superuser already exists.")
