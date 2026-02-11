
import os
import sys
import django

# Add the project root to the python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.hollander.models import Vendor
from apps.users.models import VendorProfile

User = get_user_model()

def setup_vendor_creds():
    # Get first 5 active vendors
    vendors = Vendor.objects.filter(is_active=True)[:5]
    
    if not vendors.exists():
        vendors = Vendor.objects.all()[:5]

    common_password = "vendor123"

    output_lines = []
    output_lines.append("="*50)
    output_lines.append("VENDOR LOGIN CREDENTIALS")
    output_lines.append("="*50)

    for vendor in vendors:
        email = vendor.email
        if not email:
            cleaned_name = "".join(e for e in vendor.name if e.isalnum()).lower()
            email = f"{cleaned_name}_{vendor.id}@example.com"
            vendor.email = email
            vendor.save()

        user = User.objects.filter(email=email).first()

        if user:
            user.set_password(common_password)
            user.user_type = 'vendor'
            user.save()
        else:
            base_username = email.split('@')[0]
            username = base_username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
            
            user = User.objects.create_user(
                username=username,
                email=email,
                password=common_password,
                user_type='vendor',
                is_active=True
            )

        try:
            profile, created = VendorProfile.objects.get_or_create(
                user=user,
                defaults={
                    'vendor': vendor,
                    'is_owner': True,
                    'can_edit': True,
                    'can_respond_reviews': True,
                    'can_manage_inventory': True
                }
            )
            if not created:
                profile.is_owner = True
                profile.save()
        except Exception as e:
            output_lines.append(f"Error linking profile for {email}: {e}")

        output_lines.append(f"Vendor:   {vendor.name}")
        output_lines.append(f"Email:    {email}")
        output_lines.append(f"Password: {common_password}")
        output_lines.append("-" * 30)

    with open('vendor_logins.txt', 'w') as f:
        f.write('\n'.join(output_lines))
    
    print("Credentials saved to vendor_logins.txt")

if __name__ == "__main__":
    setup_vendor_creds()
