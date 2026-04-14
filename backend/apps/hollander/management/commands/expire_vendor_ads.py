from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.hollander.models import VendorAd

class Command(BaseCommand):
    help = 'Expires vendor ads that have passed their end_date'

    def handle(self, *args, **options):
        # Find all active ads that should be expired
        today = timezone.now().date()
        expired_ads = VendorAd.objects.filter(status='active', end_date__lt=today)
        
        count = 0
        for ad in expired_ads:
            if ad.check_expiration():
                count += 1
                self.stdout.write(self.style.SUCCESS(f'Expired {ad.plan_type} ad for {ad.vendor.name}'))

        if count == 0:
            self.stdout.write(self.style.WARNING('No ads to expire today.'))
        else:
            self.stdout.write(self.style.SUCCESS(f'Successfully expired {count} ads.'))
