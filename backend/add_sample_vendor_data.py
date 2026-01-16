"""
Add sample inventory data for testing the Vendor Portal
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.users.models import User
from apps.vendor_portal.models import VendorInventory, VendorBusinessHours

def add_sample_inventory():
    print("Adding sample inventory data...")
    
    # Get the test vendor user
    try:
        user = User.objects.get(email="vendor@test.com")
        vendor = user.vendor_profile.vendor
        print(f"✓ Found vendor: {vendor.name}")
    except:
        print("✗ Test vendor user not found. Run create_test_vendor_user.py first.")
        return
    
    # Clear existing inventory
    VendorInventory.objects.filter(vendor=vendor).delete()
    print("✓ Cleared existing inventory")
    
    # Add sample Makes
    makes_data = [
        {"make": "Ford", "year_start": 2000, "year_end": 2024},
        {"make": "Chevrolet", "year_start": 2000, "year_end": 2024},
        {"make": "Toyota", "year_start": 2000, "year_end": 2024},
        {"make": "Honda", "year_start": 2000, "year_end": 2024},
    ]
    
    for data in makes_data:
        VendorInventory.objects.create(
            vendor=vendor,
            item_type="make",
            make=data["make"],
            year_start=data["year_start"],
            year_end=data["year_end"],
            is_available=True
        )
    print(f"✓ Added {len(makes_data)} makes")
    
    # Add sample Models
    models_data = [
        {"make": "Ford", "model": "F-150", "year_start": 2015, "year_end": 2024},
        {"make": "Ford", "model": "Mustang", "year_start": 2010, "year_end": 2024},
        {"make": "Chevrolet", "model": "Silverado", "year_start": 2014, "year_end": 2024},
        {"make": "Toyota", "model": "Camry", "year_start": 2012, "year_end": 2024},
        {"make": "Honda", "model": "Civic", "year_start": 2010, "year_end": 2024},
    ]
    
    for data in models_data:
        VendorInventory.objects.create(
            vendor=vendor,
            item_type="model",
            make=data["make"],
            model=data["model"],
            year_start=data["year_start"],
            year_end=data["year_end"],
            is_available=True
        )
    print(f"✓ Added {len(models_data)} models")
    
    # Add sample Parts
    parts_data = [
        {"make": "Ford", "model": "F-150", "part_name": "Alternator", "year_start": 2015, "year_end": 2020},
        {"make": "Ford", "model": "F-150", "part_name": "Transmission", "year_start": 2015, "year_end": 2020},
        {"make": "Ford", "model": "Mustang", "part_name": "Engine", "year_start": 2015, "year_end": 2020},
        {"make": "Chevrolet", "model": "Silverado", "part_name": "Radiator", "year_start": 2014, "year_end": 2020},
        {"make": "Toyota", "model": "Camry", "part_name": "Headlight", "year_start": 2012, "year_end": 2020},
        {"make": "Honda", "model": "Civic", "part_name": "Door", "year_start": 2010, "year_end": 2020},
    ]
    
    for data in parts_data:
        VendorInventory.objects.create(
            vendor=vendor,
            item_type="part",
            make=data["make"],
            model=data["model"],
            part_name=data["part_name"],
            year_start=data["year_start"],
            year_end=data["year_end"],
            is_available=True,
            notes=f"Sample {data['part_name']} for testing"
        )
    print(f"✓ Added {len(parts_data)} parts")
    
    # Add business hours
    VendorBusinessHours.objects.filter(vendor=vendor).delete()
    
    business_hours = [
        {"day": 0, "is_open": True, "open": "09:00", "close": "18:00"},  # Monday
        {"day": 1, "is_open": True, "open": "09:00", "close": "18:00"},  # Tuesday
        {"day": 2, "is_open": True, "open": "09:00", "close": "18:00"},  # Wednesday
        {"day": 3, "is_open": True, "open": "09:00", "close": "18:00"},  # Thursday
        {"day": 4, "is_open": True, "open": "09:00", "close": "18:00"},  # Friday
        {"day": 5, "is_open": True, "open": "10:00", "close": "16:00"},  # Saturday
        {"day": 6, "is_open": False, "open": None, "close": None},       # Sunday
    ]
    
    for hours in business_hours:
        VendorBusinessHours.objects.create(
            vendor=vendor,
            day_of_week=hours["day"],
            is_open=hours["is_open"],
            open_time=hours["open"],
            close_time=hours["close"]
        )
    print(f"✓ Added business hours")
    
    print("\n" + "="*60)
    print("SAMPLE DATA ADDED SUCCESSFULLY!")
    print("="*60)
    print(f"Vendor: {vendor.name}")
    print(f"Makes: {len(makes_data)}")
    print(f"Models: {len(models_data)}")
    print(f"Parts: {len(parts_data)}")
    print(f"Business Hours: 7 days configured")
    print("="*60)

if __name__ == "__main__":
    add_sample_inventory()
