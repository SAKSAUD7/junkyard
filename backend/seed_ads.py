import os
import sys
import django
from django.conf import settings
from django.core.files.base import ContentFile

# Setup Django
sys.path.append(os.getcwd())
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from apps.ads.models import Advertisement

def create_ads():
    # Ensure media directory exists
    media_ads_dir = os.path.join(settings.MEDIA_ROOT, 'ads')
    os.makedirs(media_ads_dir, exist_ok=True)
    
    # Clear existing ads for a clean slate if needed, or just add the missing ones.
    # We'll just add/update to ensure we have all 4 types.
    
    ads_to_create = [
        {
            'title': 'Minimalist Auto Service',
            'slot': 'right_sidebar_ad',
            'template_type': 'minimal',
            'button_text': 'Book Now',
            'redirect_url': 'https://example.com/minimal'
        },
        {
            'title': 'Premium Exotic Salvage',
            'slot': 'left_sidebar_ad',
            'template_type': 'premium',
            'button_text': 'Get Elite Access',
            'redirect_url': 'https://example.com/premium'
        },
        {
            'title': 'Compact Efficiency Tools',
            'slot': 'right_sidebar_ad',
            'template_type': 'compact',
            'button_text': 'View More',
            'redirect_url': 'https://example.com/compact'
        }
    ]

    for ad_data in ads_to_create:
        if not Advertisement.objects.filter(title=ad_data['title']).exists():
            print(f"Creating {ad_data['template_type']} ad...")
            ad = Advertisement(
                title=ad_data['title'],
                slot=ad_data['slot'],
                template_type=ad_data['template_type'],
                button_text=ad_data['button_text'],
                redirect_url=ad_data['redirect_url'],
                page='all',
                is_active=True,
                priority=10
            )
            # Save placeholder image
            filename = f"{ad_data['template_type']}_placeholder.jpg"
            ad.image.save(filename, ContentFile(b'fake_image_data_for_test'), save=True)
            print(f"{ad_data['template_type']} Ad Created.")
        else:
            print(f"Ad '{ad_data['title']}' already exists.")

if __name__ == '__main__':
    create_ads()
