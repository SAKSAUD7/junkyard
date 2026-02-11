import os
import django
import sys

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.users.models import User

# List all users
print("--- All Users ---")
users = User.objects.all()
for u in users:
    print(f"ID: {u.id} | Email: {u.email} | Type: {u.user_type} | Staff: {u.is_staff} | Superuser: {u.is_superuser}")

# Check specifically for admin
print("\n--- Admin Check ---")
admins = User.objects.filter(user_type='admin')
if admins.exists():
    print(f"Found {admins.count()} admin(s).")
    for a in admins:
        print(f"Admin: {a.email} (Active: {a.is_active})")
else:
    print("No users with user_type='admin' found.")
    
# Create a default admin if none exists
if not User.objects.filter(is_superuser=True).exists():
    print("\nCreating default superuser: admin@junkyard.com / admin123")
    User.objects.create_superuser('admin', 'admin@junkyard.com', 'admin123', user_type='admin')
else:
    print("\nSuperuser exists.")
