"""
Django management command to seed demo advertisements.

Usage:
    python manage.py seed_ads            # Create/update all demo ads
    python manage.py seed_ads --clear    # Delete all existing ads first, then seed
"""
from datetime import date, timedelta

from django.core.management.base import BaseCommand

from apps.ads.models import Advertisement


class Command(BaseCommand):
    help = "Seed demo advertisements across all carousel and strip slots for testing."

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Delete all existing ads before seeding.",
        )

    def handle(self, *args, **options):
        if options["clear"]:
            count, _ = Advertisement.objects.all().delete()
            self.stdout.write(self.style.WARNING(f"Deleted {count} existing ads."))

        today = date.today()
        yesterday = today - timedelta(days=1)
        next_year = today + timedelta(days=365)

        # Import Vendor model
        try:
            from apps.hollander.models import Vendor
            vendors_query = Vendor.objects.exclude(logo='').filter(is_active=True)[:500]
            
            seen_names = set()
            vendors = []
            for v in vendors_query:
                if v.name not in seen_names:
                    seen_names.add(v.name)
                    vendors.append(v)
                    if len(vendors) >= 100:
                        break
                        
            if not vendors:
                self.stdout.write(self.style.ERROR("No vendors with logos found! Please run vendor sync first."))
                return
        except ImportError:
            self.stdout.write(self.style.ERROR("Could not import Vendor model."))
            return

        def make_ad(vendor, slot, page, template_type, priority):
            redirect_url = vendor.website if vendor.website else f"/vendors/{vendor.yard_id}"
            
            obj = Advertisement.objects.create(
                title=vendor.name,
                slot=slot,
                page=page,
                template_type=template_type,
                button_text="Visit Yard",
                redirect_url=redirect_url,
                is_active=True,
                priority=priority,
                start_date=yesterday,
                end_date=next_year,
                show_badge=True,
                image=vendor.logo,
            )
            self.stdout.write(f"  [CREATED] {vendor.name[:30]}...  (slot={slot})")

        slots_config = [
            ("carousel_1", "home", ["standard", "premium", "compact"]),
            ("carousel_2", "all", ["standard", "compact"]),
            ("carousel_3", "home", ["premium", "standard"]),
            ("carousel_4", "all", ["standard", "compact"]),
            ("carousel_5", "home", ["premium", "compact"]),
            ("strip_top", "all", ["premium"]),
            ("strip_home_mid", "home", ["standard", "premium"]),
            ("strip_bottom", "all", ["premium", "standard"]),
        ]

        self.stdout.write(self.style.SUCCESS(f"\nSeeding ads from {len(vendors)} vendors..."))
        
        vendor_index = 0
        for slot, page, templates in slots_config:
            self.stdout.write(self.style.SUCCESS(f"\n>> Slot: {slot}"))
            # Assign 10 to 12 ads per slot to prevent noticeable repetition
            num_ads = 12 if 'carousel' in slot else 8
            
            for i in range(num_ads):
                if vendor_index >= len(vendors):
                    vendor_index = 0  # Loop back if we run out of vendors
                
                v = vendors[vendor_index]
                template = templates[i % len(templates)]
                priority = 10 - i
                
                make_ad(v, slot, page, template, priority)
                vendor_index += 1

        total = Advertisement.objects.filter(is_active=True).count()
        self.stdout.write(
            self.style.SUCCESS(f"\nDone! {total} active ads seeded from real vendors in the database.\n")
        )
