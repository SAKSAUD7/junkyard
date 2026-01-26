import os
import shutil
import csv
import json
import argparse
from pathlib import Path
from django.core.management.base import BaseCommand
from django.conf import settings
from django.utils.text import slugify
from apps.hollander.models import Vendor

class Command(BaseCommand):
    help = 'Match vendor logos to vendors using Images.json mapping file (Exact Match)'

    def add_arguments(self, parser):
        parser.add_argument('--source-dir', type=str, required=True, help='Directory containing logo images (account-logo)')
        parser.add_argument('--mapping-file', type=str, required=True, help='Path to Images.json mapping file')
        parser.add_argument('--dest-dir', type=str, default='vendor_logos', help='Destination directory within MEDIA_ROOT')
        parser.add_argument('--dry-run', action='store_true', help='Preview matches without making changes')
        parser.add_argument('--export-report', action='store_true', help='Export matching report to CSV')

    def handle(self, *args, **options):
        source_dir = Path(options['source_dir'])
        mapping_file = Path(options['mapping_file'])
        dest_rel_path = options['dest_dir']
        dest_dir = Path(settings.MEDIA_ROOT) / dest_rel_path
        dry_run = options['dry_run']
        export_report = options['export_report']

        if not source_dir.exists():
            self.stderr.write(f"Source directory not found: {source_dir}")
            return
        
        if not mapping_file.exists():
            self.stderr.write(f"Mapping file not found: {mapping_file}")
            return

        if not dry_run:
            dest_dir.mkdir(parents=True, exist_ok=True)

        self.stdout.write("Loading mapping file (Images.json)...")
        with open(mapping_file, 'r') as f:
            try:
                images_data = json.load(f)
            except json.JSONDecodeError as e:
                self.stderr.write(f"Error parse Images.json: {e}")
                return

        # Build map: yard_id (imageTargetID) -> filename (imageFileName)
        # Filter: imageCategoryID == "1" (Vendors seems to be 1 based on debug checks, associations are 2)
        # Need to verify if '1' is string or int in JSON. Debug check showed string "1".
        
        yard_logo_map = {}
        for img in images_data:
            # Check category. Based on previous view_file, Vendor images are CategoryID "1".
            if img.get('imageCategoryID') == "1" and img.get('imageDeleted') == "0":
                target_id = img.get('imageTargetID')
                filename = img.get('imageFileName')
                if target_id and filename:
                    # If multiple logos exist, taking the last one (most recent?) or first? 
                    # JSON seems ordered by ID. Let's overwrite to get latest if logic implies later is newer.
                    # Images.json has 'imageCreatedOn'.
                    yard_logo_map[target_id] = filename

        self.stdout.write(f"Found {len(yard_logo_map)} active vendor logo mappings.")

        self.stdout.write("Loading vendors from database...")
        vendors = Vendor.objects.all()
        self.stdout.write(f"Processing {vendors.count()} vendors...")

        stats = {
            'processed': 0,
            'matched': 0,
            'missing_file': 0,
            'unmapped': 0,
            'errors': 0
        }
        
        report_data = []

        for vendor in vendors:
            stats['processed'] += 1
            str_id = str(vendor.yard_id)
            
            logo_filename = yard_logo_map.get(str_id)
            
            if logo_filename:
                # Logo is mapped, check if file exists
                src_file = source_dir / logo_filename
                
                # Try finding file case-insensitive if exact match fails
                if not src_file.exists():
                    # Attempt case-insensitive lookup
                    found = False
                    for existing_file in source_dir.glob('*'):
                        if existing_file.name.lower() == logo_filename.lower():
                            src_file = existing_file
                            found = True
                            break
                    
                    if not found:
                        stats['missing_file'] += 1
                        report_data.append([vendor.yard_id, vendor.name, 'Mapped but File Missing', logo_filename])
                        if options.get('verbosity', 1) > 1:
                            self.stdout.write(self.style.WARNING(f"File missing for {vendor.name} ({vendor.yard_id}): {logo_filename}"))
                        continue

                # File exists!
                # Create sanitized new filename
                safe_name = slugify(vendor.name)
                ext = src_file.suffix
                new_filename = f"{safe_name}-{vendor.yard_id}{ext}"
                dest_file = dest_dir / new_filename
                
                db_path = f"{dest_rel_path}/{new_filename}"

                stats['matched'] += 1
                report_data.append([vendor.yard_id, vendor.name, 'Matched', new_filename])
                
                if not dry_run:
                    try:
                        shutil.copy2(src_file, dest_file)
                        vendor.logo = db_path
                        vendor.logo_source = 'matched'
                        vendor.logo_verified = True
                        vendor.save()
                        if options.get('verbosity', 1) > 1:
                            self.stdout.write(self.style.SUCCESS(f"Matched: {vendor.name} -> {new_filename}"))
                    except Exception as e:
                        stats['errors'] += 1
                        self.stderr.write(f"Error saving {vendor.name}: {e}")
                else:
                    if options.get('verbosity', 1) > 1:
                        self.stdout.write(f"[Dry Run] Match: {vendor.name} -> {src_file.name} as {new_filename}")

            else:
                stats['unmapped'] += 1
                # Ensure it's marked as placeholder if not manual?
                # For now, just logging. User said "For No Confident Match: Assign default placeholder".
                # Vendor model default is likely placeholder.
                # If we want to be explicit:
                # if not dry_run and vendor.logo_source == 'placeholder':
                #     vendor.logo_source = 'placeholder'
                #     vendor.save()
                report_data.append([vendor.yard_id, vendor.name, 'No Match Found', ''])

        self.stdout.write(self.style.SUCCESS("----------------------------------------------------------------"))
        self.stdout.write(f"Matching Complete (Dry Run: {dry_run})")
        self.stdout.write(f"PROCESSED:    {stats['processed']}")
        self.stdout.write(f"MATCHED:      {stats['matched']}")
        self.stdout.write(f"UNMAPPED:     {stats['unmapped']}")
        self.stdout.write(f"MISSING FILE: {stats['missing_file']}")
        self.stdout.write(f"ERRORS:       {stats['errors']}")
        self.stdout.write(self.style.SUCCESS("----------------------------------------------------------------"))

        if export_report:
            report_path = 'logo_matching_report.csv'
            with open(report_path, 'w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow(['Yard ID', 'Name', 'Status', 'Filename'])
                writer.writerows(report_data)
            self.stdout.write(f"Report exported to {report_path}")
