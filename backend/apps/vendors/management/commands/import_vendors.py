import json
import os
from django.core.management.base import BaseCommand
from apps.vendors.models import Vendor


class Command(BaseCommand):
    help = 'Import missing vendors from data_junkyards.json without duplicates'

    def normalize_key(self, name, city, state, address):
        """Create a normalized deduplication key"""
        return f"{name.lower().strip()}|{city.lower().strip()}|{state.lower().strip()}|{address.lower().strip()}"

    def handle(self, *args, **options):
        from django.conf import settings
        
        # Path to JSON file
        json_path = os.path.join(
            settings.BASE_DIR.parent,
            'frontend', 'public', 'data', 'data_junkyards.json'
        )

        self.stdout.write(f"Reading vendors from: {json_path}")

        # Load JSON data
        with open(json_path, 'r', encoding='utf-8') as f:
            json_vendors = json.load(f)

        self.stdout.write(f"Found {len(json_vendors)} vendors in JSON file")

        # Get existing vendors and create deduplication set
        existing_vendors = Vendor.objects.all()
        existing_keys = set()
        
        for vendor in existing_vendors:
            key = self.normalize_key(vendor.name, vendor.city, vendor.state, vendor.address)
            existing_keys.add(key)

        self.stdout.write(f"Found {len(existing_keys)} existing vendors in database")

        # Find and import missing vendors
        vendors_to_create = []
        skipped_count = 0

        for json_vendor in json_vendors:
            key = self.normalize_key(
                json_vendor.get('name', ''),
                json_vendor.get('city', ''),
                json_vendor.get('state', ''),
                json_vendor.get('address', '')
            )

            if key not in existing_keys:
                # This vendor doesn't exist, add it
                vendors_to_create.append(Vendor(
                    name=json_vendor.get('name', ''),
                    address=json_vendor.get('address', ''),
                    city=json_vendor.get('city', ''),
                    state=json_vendor.get('state', ''),
                    zipcode=json_vendor.get('zipcode', ''),
                    description=json_vendor.get('description', ''),
                    review_snippet=json_vendor.get('reviewSnippet', ''),
                    rating=json_vendor.get('rating', '100%'),
                    profile_url=json_vendor.get('profileUrl', ''),
                    logo=json_vendor.get('logo', '/images/logo-placeholder.png')
                ))
                existing_keys.add(key)  # Add to set to prevent duplicates within this batch
            else:
                skipped_count += 1

        # Bulk create new vendors
        if vendors_to_create:
            Vendor.objects.bulk_create(vendors_to_create, batch_size=100)
            self.stdout.write(
                self.style.SUCCESS(f'Successfully imported {len(vendors_to_create)} new vendors')
            )
        else:
            self.stdout.write(self.style.WARNING('No new vendors to import'))

        self.stdout.write(f"Skipped {skipped_count} duplicate vendors")
        
        # Final count
        final_count = Vendor.objects.count()
        self.stdout.write(self.style.SUCCESS(f'Total vendors in database: {final_count}'))
