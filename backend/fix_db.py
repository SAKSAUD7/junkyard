import os
import sys
import django
from datetime import timedelta
from django.utils import timezone

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.cms.models import SiteContent
from apps.ads.models import Advertisement

def fix_db():
    print("Fixing CMS Hero Section fields...")
    updated_cms = SiteContent.objects.filter(page='home', section='hero', key__in=['heading', 'subheading']).update(content_type='textarea')
    print(f"Updated {updated_cms} CMS fields to 'textarea'.")

    print("Fixing Advertisements visibility...")
    now = timezone.now().date()
    yesterday = now - timedelta(days=1)
    
    # Make all ads active, valid start date, and no end date, available on all pages
    updated_ads = Advertisement.objects.all().update(
        is_active=True,
        start_date=yesterday,
        end_date=None,
        page='all'
    )
    print(f"Fixed {updated_ads} ads to be active and globally visible.")

if __name__ == '__main__':
    fix_db()
