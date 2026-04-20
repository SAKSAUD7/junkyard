import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from apps.cms.models import SiteContent

replacements = {
    '/images/about-mission.jpg': '/heroes/salvage-sunset.png',
    '/heroes/junkyard-night.jpg': '/heroes/stacked-cars.png',
    '/heroes/contact-bg.jpg': '/heroes/aerial-night.png',
    '/heroes/blog-bg.jpg': '/heroes/muscle-car-garage-dark.png',
    '/heroes/faq-bg.jpg': '/heroes/salvage-sunset.png',
    '/heroes/how-it-works-bg.jpg': '/heroes/car-crusher.png'
}

for bad_url, good_url in replacements.items():
    SiteContent.objects.filter(value=bad_url).update(value=good_url)

print("Updated SiteContent image URLs.")
