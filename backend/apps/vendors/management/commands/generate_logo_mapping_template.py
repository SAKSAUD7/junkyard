"""
Generate CSV Template for Manual Logo Mapping
==============================================

Since automated matching isn't possible with hashed filenames,
this generates a CSV template for manual mapping.

The CSV can be edited in Excel/Google Sheets and then imported.

Usage:
    python manage.py generate_logo_mapping_template
"""

from django.core.management.base import BaseCommand
from apps.vendors.models import Vendor
from django.conf import settings
from pathlib import Path
import os
import csv

class Command(BaseCommand):
    help = 'Generate CSV template for manual logo mapping'

    def handle(self, *args, **options):
        # Get paths
        backend_dir = Path(settings.BASE_DIR)
        project_root = backend_dir.parent
        logos_dir = project_root / 'frontend' / 'public' / 'images' / 'vendors'
        output_file = backend_dir / 'vendor_logo_mapping_template.csv'
        
        self.stdout.write("=" * 80)
        self.stdout.write(self.style.SUCCESS("LOGO MAPPING TEMPLATE GENERATOR"))
        self.stdout.write("=" * 80)
        self.stdout.write("")
        
        # Get all vendors
        vendors = Vendor.objects.filter(logo='/images/logo-placeholder.png').order_by('name')
        
        # Get all logo files
        try:
            logo_files = sorted([f for f in os.listdir(logos_dir) if os.path.isfile(os.path.join(logos_dir, f))])
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"ERROR: {e}"))
            return
        
        self.stdout.write(f"Vendors without logos: {vendors.count()}")
        self.stdout.write(f"Available logo files: {len(logo_files)}")
        self.stdout.write("")
        
        # Generate CSV
        with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.writer(csvfile)
            
            # Header
            writer.writerow([
                'vendor_id',
                'vendor_name',
                'city',
                'state',
                'logo_filename',
                'notes'
            ])
            
            # Write vendors
            for vendor in vendors:
                writer.writerow([
                    vendor.id,
                    vendor.name,
                    vendor.city,
                    vendor.state,
                    '',  # Empty logo_filename for manual entry
                    ''   # Empty notes
                ])
        
        # Also create a reference file with all available logos
        logo_reference_file = backend_dir / 'available_logo_files.txt'
        with open(logo_reference_file, 'w', encoding='utf-8') as f:
            f.write("AVAILABLE LOGO FILES\n")
            f.write("=" * 80 + "\n\n")
            f.write(f"Total files: {len(logo_files)}\n")
            f.write(f"Location: {logos_dir}\n\n")
            f.write("Files:\n")
            f.write("-" * 80 + "\n")
            for logo_file in logo_files:
                f.write(f"{logo_file}\n")
        
        self.stdout.write(self.style.SUCCESS(f"✓ Template created: {output_file}"))
        self.stdout.write(self.style.SUCCESS(f"✓ Logo reference: {logo_reference_file}"))
        self.stdout.write("")
        self.stdout.write("NEXT STEPS:")
        self.stdout.write("1. Open vendor_logo_mapping_template.csv in Excel/Google Sheets")
        self.stdout.write("2. For each vendor, enter the logo filename in the 'logo_filename' column")
        self.stdout.write("3. Use available_logo_files.txt as reference for filenames")
        self.stdout.write("4. Save the CSV file")
        self.stdout.write("5. Run: python manage.py import_logo_mapping vendor_logo_mapping_template.csv")
        self.stdout.write("")
