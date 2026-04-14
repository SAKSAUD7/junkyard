import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.ads.serializers import AdvertisementSerializer

data = {
    "title": "Test Title",
    "redirect_url": "https://new-portfolio-orpin-iota-64.vercel.app/#contact",
    "page": "home",
    "slot": "left_sidebar_ad",
    "template_type": "minimal",
    "button_text": "Visit Website",
    "show_badge": "true",
    "is_active": "true",
    "start_date": "2026-04-14",
    "end_date": "2026-04-14",
    "priority": 1
}

serializer = AdvertisementSerializer(data=data)
if not serializer.is_valid():
    print("ERRORS:", serializer.errors)
else:
    print("VALID!")
