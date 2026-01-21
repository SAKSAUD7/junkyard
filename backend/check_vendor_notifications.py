import os
import sys
import django

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.leads.models import VendorLead
from apps.vendor_portal.models import VendorNotification
from apps.hollander.models import Vendor

print("=" * 80)
print("VENDOR LEAD NOTIFICATION VERIFICATION")
print("=" * 80)

# Get the most recent vendor lead
recent_vendor_leads = VendorLead.objects.all().order_by('-created_at')[:5]

if not recent_vendor_leads:
    print("\n[X] No vendor leads found in the database.")
    sys.exit(1)

print(f"\n[INFO] Found {recent_vendor_leads.count()} recent vendor lead(s):\n")

for lead in recent_vendor_leads:
    print(f"VendorLead #{lead.id}:")
    print(f"  - Created: {lead.created_at}")
    print(f"  - Vehicle: {lead.year} {lead.make} {lead.model}")
    print(f"  - Customer: {lead.name} ({lead.phone})")
    print(f"  - State: {lead.state}")
    print(f"  - Zip: {lead.zip}")
    
    # Check vendors in that state
    matching_vendors = Vendor.objects.filter(
        state__iexact=lead.state,
        is_active=True
    )
    
    print(f"\n  [VENDORS] In state '{lead.state}' (active): {matching_vendors.count()}")
    for vendor in matching_vendors[:5]:  # Show first 5
        print(f"     - {vendor.name} ({vendor.state})")
    
    # Check notifications created for this lead
    notifications = VendorNotification.objects.filter(vendor_lead=lead)
    
    print(f"\n  [NOTIFICATIONS] Created: {notifications.count()}")
    for notif in notifications[:5]:  # Show first 5
        status = "[READ]" if notif.is_read else "[UNREAD]"
        print(f"     - {notif.vendor.name}: {status}")
    
    print("\n" + "-" * 80 + "\n")

# Summary
print("\n" + "=" * 80)
print("SUMMARY")
print("=" * 80)

latest_lead = recent_vendor_leads.first()
if latest_lead:
    matching_vendors_count = Vendor.objects.filter(
        state__iexact=latest_lead.state,
        is_active=True
    ).count()
    
    notifications_count = VendorNotification.objects.filter(
        vendor_lead=latest_lead
    ).count()
    
    print(f"\nLatest VendorLead: #{latest_lead.id} (State: {latest_lead.state})")
    print(f"Active vendors in {latest_lead.state}: {matching_vendors_count}")
    print(f"Notifications created: {notifications_count}")
    
    if matching_vendors_count == notifications_count:
        print("\n[SUCCESS] All matching vendors received notifications!")
    else:
        print(f"\n[WARNING] Mismatch detected!")
        print(f"   Expected {matching_vendors_count} notifications, but found {notifications_count}")

