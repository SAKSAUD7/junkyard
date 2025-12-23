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

    # Create a dummy image if one doesn't exist (programmatic red square)
    # We'll just use a text file masquerading as an image or copy a known image if possible.
    # Actually, let's just make sure we don't crash.
    # We can create a simple active ad.
    
    # Left Ad
    if not Advertisement.objects.filter(slot='left_sidebar_ad').exists():
        print("Creating Left Ad...")
        ad_left = Advertisement(
            title="Test Left Ad",
            slot='left_sidebar_ad',
            redirect_url="https://google.com",
            is_active=True,
            priority=10
        )
        # Save placeholder image
        ad_left.image.save('left_placeholder.jpg', ContentFile(b'fake_image_data_for_test'), save=True)
        print("Left Ad Created.")
    else:
        print("Left Ad already exists.")

    # Right Ad
    if not Advertisement.objects.filter(slot='right_sidebar_ad').exists():
        print("Creating Right Ad...")
        ad_right = Advertisement(
            title="Test Right Ad",
            slot='right_sidebar_ad',
            redirect_url="https://bing.com",
            is_active=True,
            priority=10
        )
        ad_right.image.save('right_placeholder.jpg', ContentFile(b'fake_image_data_for_test'), save=True)
        print("Right Ad Created.")
    else:
        print("Right Ad already exists.")

if __name__ == '__main__':
    create_ads()
