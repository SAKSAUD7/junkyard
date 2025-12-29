"""
Import Logo Mapping from CSV
=============================

Imports vendor logo mappings from a CSV file.

CSV Format:
vendor_id,vendor_name,city,state,logo_filename,notes
1,Auto Recycling Mall,Maricopa,AZ,abc123.png,

Usage:
    python manage.py import_logo_mapping vendor_logo_mapping_template.csv
    python manage.py import_logo_mapping vendor_logo_mapping_template.csv --apply
"""

from django.core.management.base import BaseCommand
from apps.vendors.models import Vendor
from django.conf import settings
from pathlib import Path
import os
import csv

class Command(BaseCommand):
    help = 'Import vendor logo mappings from CSV file'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str, help='Path to CSV file')
        parser.add_argument(
            '--apply',
            action='store_true',
            help='Actually update the database',
        )

    def handle(self, *args, **options):
        csv_file = options['csv_file']
        dry_run = not options['apply']
        
        # Get paths
        backend_dir = Path(settings.BASE_DIR)
        project_root = backend_dir.parent
        logos_dir = project_root / 'frontend' / 'public' / 'images' / 'vendors'
        
        # Resolve CSV path
        if not os.path.isabs(csv_file):
            csv_file = backend_dir / csv_file
        
        self.stdout.write("=" * 80)
        self.stdout.write(self.style.SUCCESS("LOGO MAPPING IMPORTER"))
        self.stdout.write("=" * 80)
        self.stdout.write("")
        
        if not os.path.exists(csv_file):
            self.stdout.write(self.style.ERROR(f"ERROR: CSV file not found: {csv_file}"))
            return
        
        self.stdout.write(f"CSV file: {csv_file}")
        self.stdout.write(f"Mode: {'APPLY CHANGES' if not dry_run else 'DRY RUN'}")
        self.stdout.write("")
        
        # Statistics
        total_rows = 0
        updated = 0
        skipped_empty = 0
        vendor_not_found = 0
        file_not_found = 0
        errors = 0
        
        try:
            with open(csv_file, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                
                for row in reader:
                    total_rows += 1
                    vendor_id = row.get('vendor_id', '').strip()
                    logo_filename = row.get('logo_filename', '').strip()
                    
                    # Skip if no logo filename provided
                    if not logo_filename:
                        skipped_empty += 1
                        continue
                    
                    # Skip if no vendor ID
                    if not vendor_id:
                        errors += 1
                        self.stdout.write(self.style.ERROR(f"[ERROR] Row {total_rows}: Missing vendor_id"))
                        continue
                    
                    try:
                        vendor = Vendor.objects.get(id=int(vendor_id))
                    except Vendor.DoesNotExist:
                        vendor_not_found += 1
                        self.stdout.write(self.style.WARNING(f"[NOT FOUND] Vendor ID {vendor_id}"))
                        continue
                    except ValueError:
                        errors += 1
                        self.stdout.write(self.style.ERROR(f"[ERROR] Invalid vendor_id: {vendor_id}"))
                        continue
                    
                    # Verify logo file exists
                    logo_file_path = logos_dir / logo_filename
                    if not logo_file_path.exists():
                        file_not_found += 1
                        self.stdout.write(self.style.WARNING(
                            f"[FILE NOT FOUND] {vendor.name} -> {logo_filename}"
                        ))
                        continue
                    
                    # Update vendor
                    logo_path = f"/images/vendors/{logo_filename}"
                    
                    if not dry_run:
                        vendor.logo = logo_path
                        vendor.save(update_fields=['logo'])
                    
                    updated += 1
                    self.stdout.write(self.style.SUCCESS(f"[UPDATE] {vendor.name} -> {logo_filename}"))
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"ERROR reading CSV: {e}"))
            return
        
        # Summary
        self.stdout.write("")
        self.stdout.write("=" * 80)
        self.stdout.write(self.style.SUCCESS("SUMMARY"))
        self.stdout.write("=" * 80)
        self.stdout.write(f"Total rows in CSV:          {total_rows}")
        self.stdout.write(f"Vendors updated:            {updated}")
        self.stdout.write(f"Skipped (no logo):          {skipped_empty}")
        self.stdout.write(f"Vendor not found:           {vendor_not_found}")
        self.stdout.write(f"Logo file not found:        {file_not_found}")
        self.stdout.write(f"Errors:                     {errors}")
        
        if dry_run:
            self.stdout.write("")
            self.stdout.write(self.style.WARNING("DRY RUN MODE - No changes were made"))
            self.stdout.write("   Run with --apply to update database")
        else:
            self.stdout.write("")
            self.stdout.write(self.style.SUCCESS(f"Database updated: {updated} vendors"))
        
        self.stdout.write("")
