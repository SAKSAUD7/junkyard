import django
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.hollander.models import Vendor

# Search for Classic Auto Salvage
vendor = Vendor.objects.filter(name__icontains='classic auto salvage').first()

print('=' * 60)
print('VENDOR LOGO CHECK: Classic Auto Salvage')
print('=' * 60)

if vendor:
    print('Found: YES')
    print(f'Name: {vendor.name}')
    print(f'City: {vendor.city}')
    print(f'State: {vendor.state}')
    print(f'Logo Path: {vendor.logo}')
    has_logo = vendor.logo != "/images/logo-placeholder.png"
    print(f'Has Custom Logo: {"YES" if has_logo else "NO"}')
else:
    print('Vendor not found in database')

print('=' * 60)
