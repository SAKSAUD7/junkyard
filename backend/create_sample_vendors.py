import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.hollander.models import Vendor

def create_sample_vendors():
    """Create sample vendors for testing"""
    print("Creating sample vendors...")
    
    vendors_data = [
        {
            "yard_id": 1001,
            "name": "Auto Parts Salvage Plus",
            "address": "123 Industrial Blvd",
            "city": "Los Angeles",
            "state": "CA",
            "zip_code": "90001",
            "phone": "(323) 555-0100",
            "email": "contact@autopartssalvageplus.com",
            "website": "https://www.autopartssalvageplus.com",
            "description": "Your trusted source for quality used auto parts in Los Angeles. We specialize in foreign and domestic vehicles.",
            "is_featured": True,
            "is_top_rated": True,
        },
        {
            "yard_id": 1002,
            "name": "Premier Junkyard & Auto Recycling",
            "address": "456 Route 66",
            "city": "Phoenix",
            "state": "AZ",
            "zip_code": "85001",
            "phone": "(602) 555-0200",
            "email": "info@premierjunkyard.com",
            "website": "https://www.premierjunkyard.com",
            "description": "Phoenix's leading auto recycling facility with over 20 years of experience.",
            "is_featured": True,
        },
        {
            "yard_id": 1003,
            "name": "Discount Auto Parts & Salvage",
            "address": "789 Commerce St",
            "city": "Houston",
            "state": "TX",
            "zip_code": "77001",
            "phone": "(713) 555-0300",
            "email": "sales@discountautoparts.com",
            "website": "https://www.discountautoparts.com",
            "description": "Affordable used auto parts for all makes and models. Same-day pickup available.",
        },
        {
            "yard_id": 1004,
            "name": "Quality Used Parts Center",
            "address": "321 Main Avenue",
            "city": "Miami",
            "state": "FL",
            "zip_code": "33101",
            "phone": "(305) 555-0400",
            "email": "parts@qualityusedparts.com",
            "website": "https://www.qualityusedparts.com",
            "description": "Florida's premier auto parts recycler serving Miami and surrounding areas.",
            "is_top_rated": True,
        },
        {
            "yard_id": 1005,
            "name": "Green Auto Recyclers",
            "address": "654 Eco Way",
            "city": "Seattle",
            "state": "WA",
            "zip_code": "98101",
            "phone": "(206) 555-0500",
            "email": "contact@greenautorecyclers.com",
            "website": "https://www.greenautorecyclers.com",
            "description": "Environmentally responsible auto parts recycling. We offer a wide selection of quality used parts.",
            "is_featured": True,
        },
        {
            "yard_id": 1006,
            "name": "Metro Salvage Yard",
            "address": "987 Industrial Park Dr",
            "city": "Chicago",
            "state": "IL",
            "zip_code": "60601",
            "phone": "(312) 555-0600",
            "email": "info@metrosalvage.com",
            "website": "https://www.metrosalvage.com",
            "description": "Chicago's largest selection of used auto parts. We buy junk cars too!",
        },
        {
            "yard_id": 1007,
           "name": "All American Auto Parts",
            "address": "159 Liberty Lane",
            "city": "New York",
            "state": "NY",
            "zip_code": "10001",
            "phone": "(212) 555-0700",
            "email": "sales@allamericanauto.com",
            "website": "https://www.allamericanauto.com",
            "description": "Serving NYC since 1995. Specializing in domestic and import auto parts.",
            "is_top_rated": True,
        },
        {
            "yard_id": 1008,
            "name": "Sunshine State Auto Recycling",
            "address": "753 Orange Grove Rd",
            "city": "Tampa",
            "state": "FL",
            "zip_code": "33602",
            "phone": "(813) 555-0800",
            "email": "parts@sunshineautorecycling.com",
            "website": "https://www.sunshineautorecycling.com",
            "description": "Tampa Bay's trusted auto parts supplier with excellent customer service.",
        },
    ]
    
    created_count = 0
    for vendor_data in vendors_data:
        vendor, created = Vendor.objects.get_or_create(
            yard_id=vendor_data["yard_id"],
            defaults=vendor_data
        )
        if created:
            created_count += 1
            print(f"✅ Created: {vendor.name}")
        else:
            print(f"⚠️  Already exists: {vendor.name}")
    
    print(f"\n{'='*60}")
    print(f"SAMPLE VENDORS CREATED!")
    print(f"{'='*60}")
    print(f"Total vendors created: {created_count}")
    print(f"Total vendors in database: {Vendor.objects.count()}")
    print(f"{'='*60}")

if __name__ == "__main__":
    create_sample_vendors()
