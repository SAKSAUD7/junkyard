import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.ads.models import Advertisement
from django.utils import timezone

print("=== ALL ADS IN DATABASE ===")
ads = Advertisement.objects.all()
print(f"Total ads: {ads.count()}\n")

for ad in ads:
    print(f"ID: {ad.id}")
    print(f"Title: {ad.title}")
    print(f"Slot: {ad.slot}")
    print(f"Page: {ad.page}")
    print(f"Active: {ad.is_active}")
    print(f"Start Date: {ad.start_date}")
    print(f"End Date: {ad.end_date}")
    print(f"Template: {ad.template_type}")
    print(f"Image: {ad.image}")
    print(f"Priority: {ad.priority}")
    
    # Check if ad should be active today
    now = timezone.now().date()
    is_date_valid = ad.start_date <= now and (ad.end_date is None or ad.end_date >= now)
    print(f"Date Valid: {is_date_valid} (Today: {now})")
    print("-" * 50)
