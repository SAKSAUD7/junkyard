import json
import os
from django.core.management.base import BaseCommand
from apps.hollander.models import Vendor

class Command(BaseCommand):
    help = 'Import vendors from data_junkyards.json (entries 651 to end)'

    def handle(self, *args, **options):
        # Path to the JSON file
        json_file = '/home/adminpc/junkyard/junkyard/frontend/public/data/data_junkyards.json'
        
        # Load the JSON data
        with open(json_file, 'r') as f:
            data = json.load(f)
        
        # Get entries from 651 to end (index 650 onwards)
        vendors_to_import = data[650:]
        
        self.stdout.write(f'Found {len(vendors_to_import)} vendors to import (entries 651-{len(data)})')
        
        imported_count = 0
        skipped_count = 0
        error_count = 0
        
        for vendor_data in vendors_to_import:
            try:
                # Extract data
                name = vendor_data.get('name', '').strip()
                address = vendor_data.get('address', '').strip()
                city = vendor_data.get('city', '').strip()
                state = vendor_data.get('state', '').strip().upper()
                zipcode = vendor_data.get('zipcode', '').strip()
                description = vendor_data.get('description', '').strip()
                rating = vendor_data.get('rating', '100%')
                
                # Skip if name is empty
                if not name:
                    self.stdout.write(self.style.WARNING(f'Skipping entry {vendor_data.get("id")} - no name'))
                    skipped_count += 1
                    continue
                
                # Check if vendor already exists (by name and city)
                existing = Vendor.objects.filter(name=name, city=city).first()
                if existing:
                    self.stdout.write(self.style.WARNING(f'Skipping {name} - already exists'))
                    skipped_count += 1
                    continue
                
                # Create vendor
                vendor = Vendor.objects.create(
                    name=name,
                    address=address,
                    city=city,
                    state=state,
                    zipcode=zipcode,
                    description=description,
                    rating=rating,
                    is_active=True
                )
                
                imported_count += 1
                if imported_count % 50 == 0:
                    self.stdout.write(f'Imported {imported_count} vendors...')
                    
            except Exception as e:
                error_count += 1
                self.stdout.write(self.style.ERROR(f'Error importing {vendor_data.get("name", "Unknown")}: {str(e)}'))
        
        self.stdout.write(self.style.SUCCESS(f'\n=== Import Complete ==='))
        self.stdout.write(self.style.SUCCESS(f'Imported: {imported_count}'))
        self.stdout.write(self.style.WARNING(f'Skipped: {skipped_count}'))
        if error_count > 0:
            self.stdout.write(self.style.ERROR(f'Errors: {error_count}'))
