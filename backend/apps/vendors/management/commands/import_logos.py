"""
Import vendor logos from data_junkyards.json
Database-first approach using existing JSON data
"""
from django.core.management.base import BaseCommand
from apps.vendors.models import Vendor
import json
from pathlib import Path
import os

class Command(BaseCommand):
    help = 'Import vendor logos from JSON data file'

    def add_arguments(self, parser):
        parser.add_argument(
            '--apply',
            action='store_true',
            help='Actually update the database (default is dry-run)',
        )

    def handle(self, *args, **options):
        dry_run = not options['apply']
        
        # Get paths
        from django.conf import settings
        backend_dir = Path(settings.BASE_DIR)
        project_root = backend_dir.parent
        json_path = project_root / 'frontend' / 'public' / 'data' / 'data_junkyards.json'
        logos_dir = project_root / 'frontend' / 'public' / 'images' / 'vendors'
        
        self.stdout.write("=" * 80)
        self.stdout.write(self.style.SUCCESS("VENDOR LOGO IMPORT - JSON-BASED APPROACH"))
        self.stdout.write("=" * 80)
        self.stdout.write("")
        
        # Check if JSON file exists
        if not json_path.exists():
            self.stdout.write(self.style.ERROR(f"ERROR: JSON file not found: {json_path}"))
            return
        
        self.stdout.write(f"JSON file: {json_path}")
        self.stdout.write(f"Logos directory: {logos_dir}")
        self.stdout.write(f"Mode: {'DRY RUN' if dry_run else 'APPLY CHANGES'}")
        self.stdout.write("")
        
        # Load JSON data
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                junkyards = json.load(f)
            self.stdout.write(f"Loaded {len(junkyards)} junkyards from JSON")
            self.stdout.write("")
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"ERROR loading JSON: {e}"))
            return
        
        # Statistics
        updated = 0
        skipped_placeholder = 0
        skipped_no_logo = 0
        not_found_in_db = 0
        file_not_found = 0
        already_set = 0
        
        self.stdout.write("Processing junkyards...")
        self.stdout.write("")
        
        for junkyard in junkyards:
            junkyard_id = junkyard.get('id')
            logo = junkyard.get('logo', '')
            name = junkyard.get('name', 'Unknown')
            
            # Skip if no logo field
            if not logo:
                skipped_no_logo += 1
                continue
            
            # Skip placeholders
            if logo == '/images/logo-placeholder.png':
                skipped_placeholder += 1
                continue
            
            # Try to find vendor in database
            try:
                vendor = Vendor.objects.get(id=junkyard_id)
                
                # Check if vendor already has this logo
                if vendor.logo == logo:
                    already_set += 1
                    continue
                
                # Verify logo file exists
                logo_file_path = project_root / 'frontend' / 'public' / logo.lstrip('/')
                if not logo_file_path.exists():
                    file_not_found += 1
                    self.stdout.write(self.style.WARNING(
                        f"[FILE NOT FOUND] {name} -> {logo}"
                    ))
                    continue
                
                # Update vendor
                if not dry_run:
                    vendor.logo = logo
                    vendor.save(update_fields=['logo'])
                
                updated += 1
                self.stdout.write(self.style.SUCCESS(
                    f"[UPDATE] {name}"
                ))
                self.stdout.write(f"   -> {logo}")
                
            except Vendor.DoesNotExist:
                not_found_in_db += 1
                if not_found_in_db <= 5:  # Show first 5
                    self.stdout.write(self.style.WARNING(
                        f"[NOT IN DB] ID {junkyard_id}: {name}"
                    ))
        
        # Summary
        self.stdout.write("")
        self.stdout.write("=" * 80)
        self.stdout.write(self.style.SUCCESS("SUMMARY"))
        self.stdout.write("=" * 80)
        self.stdout.write(f"Total in JSON:              {len(junkyards)}")
        self.stdout.write(f"Vendors updated:            {updated}")
        self.stdout.write(f"Already had correct logo:   {already_set}")
        self.stdout.write(f"Skipped (placeholder):      {skipped_placeholder}")
        self.stdout.write(f"Skipped (no logo field):    {skipped_no_logo}")
        self.stdout.write(f"Not found in database:      {not_found_in_db}")
        self.stdout.write(f"Logo file not found:        {file_not_found}")
        
        if dry_run:
            self.stdout.write("")
            self.stdout.write(self.style.WARNING("DRY RUN MODE - No changes were made"))
            self.stdout.write("   Run with --apply to update database")
        else:
            self.stdout.write("")
            self.stdout.write(self.style.SUCCESS(f"Database updated: {updated} vendors"))
        
        self.stdout.write("")
        
        # Calculate success rate
        total_processable = len(junkyards) - skipped_placeholder - skipped_no_logo
        if total_processable > 0:
            success_rate = (updated / total_processable) * 100
            self.stdout.write(f"Success rate: {success_rate:.1f}%")
        
        self.stdout.write("")
