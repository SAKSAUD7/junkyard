import django
import os
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.ads.models import Advertisement

try:
    # List all ads
    ads = Advertisement.objects.all()
    print(f"Total ads: {ads.count()}")
    for ad in ads:
        print(f"  - Ad {ad.id}: {ad.title}, slot={ad.slot}, page={ad.page}")
    
    # Try to get ad #6
    try:
        ad6 = Advertisement.objects.get(pk=6)
        print(f"\nAd #6 found: {ad6.title}")
        print(f"Fields: {[(f.name, getattr(ad6, f.name)) for f in ad6._meta.fields]}")
    except Advertisement.DoesNotExist:
        print("\nAd #6 does not exist")
        
except Exception as e:
    print(f"Error: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()
