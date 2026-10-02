import os
import sys
import django
import json

# Setup Django Environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.cms.models import SiteContent

def seed():
    print("Seeding Add-a-Yard and Vendor Portal CMS data...")

    # ADD A YARD WIZARD TEXT
    add_a_yard_data = [
        {'section': 'wizard', 'key': 'step1_title', 'value': 'Basic Info', 'label': 'Step 1 Form Title', 'type': 'text'},
        {'section': 'wizard', 'key': 'step1_subtitle', 'value': 'Create your vendor profile', 'label': 'Step 1 Form Subtitle', 'type': 'text'},
        {'section': 'wizard', 'key': 'step2_title', 'value': 'Location Details', 'label': 'Step 2 Form Title', 'type': 'text'},
        {'section': 'wizard', 'key': 'step2_subtitle', 'value': 'Where are you located?', 'label': 'Step 2 Form Subtitle', 'type': 'text'},
        {'section': 'wizard', 'key': 'step3_title', 'value': 'Services & Business Info', 'label': 'Step 3 Form Title', 'type': 'text'},
        {'section': 'wizard', 'key': 'step3_subtitle', 'value': 'What do you specialize in?', 'label': 'Step 3 Form Subtitle', 'type': 'text'},
        {'section': 'wizard', 'key': 'step4_title', 'value': 'Review & Submit', 'label': 'Step 4 Form Title', 'type': 'text'},
        {'section': 'wizard', 'key': 'step4_subtitle', 'value': 'Ensure your details are correct', 'label': 'Step 4 Form Subtitle', 'type': 'text'},
    ]

    for item in add_a_yard_data:
        obj, created = SiteContent.objects.update_or_create(
            page='add_a_yard',
            section=item['section'],
            key=item['key'],
            defaults={
                'value': item['value'],
                'label': item['label'],
                'content_type': item['type'],
                'is_active': True
            }
        )
        print(f"{'Created' if created else 'Updated'} add_a_yard: {item['key']}")

    # VENDOR PORTAL - ADS PRICING (4 tiers — must match frontend fallback defaults)
    ads_json = [
        {
            "id": "minimal",
            "type": "minimal",
            "name": "Minimal Plan",
            "pricing": 19,
            "duration": 30,
            "features": ["Basic marketplace visibility", "Standard SEO indexing", "Base catalog linkage"],
            "placement": "standard",
            "is_popular": False
        },
        {
            "id": "compact",
            "type": "compact",
            "name": "Compact Plan",
            "pricing": 29,
            "duration": 30,
            "features": ["Highlighted layout aesthetic", "Verified badge on profile", "Mobile-optimized profile snippet"],
            "placement": "standard",
            "is_popular": False
        },
        {
            "id": "standard",
            "type": "standard",
            "name": "Standard Plan",
            "pricing": 49,
            "duration": 30,
            "features": ["Elevated search standing", "\"Featured\" vendor status badge", "Unlimited profile impressions", "Dashboard analytics unlocked"],
            "placement": "standard",
            "is_popular": False
        },
        {
            "id": "premium",
            "type": "premium",
            "name": "Premium Plan",
            "pricing": 99,
            "duration": 30,
            "features": ["#1 Priority in search results", "Homepage rotating banner", "Priority lead generation mapping", "\"Top Rated\" trusted vendor badge", "Advanced analytics"],
            "placement": "featured",
            "is_popular": True
        }
    ]

    obj, created = SiteContent.objects.update_or_create(
        page='vendor_portal',
        section='ads',
        key='ad_plans',
        defaults={
            'value': json.dumps(ads_json, indent=2),
            'label': 'Vendor Ad Purchase Plans',
            'content_type': 'json',
            'is_active': True
        }
    )
    print(f"{'Created' if created else 'Updated'} vendor_portal: ad_plans")
    print("Seeding complete.")

if __name__ == '__main__':
    seed()
