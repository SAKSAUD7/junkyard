"""
Django management command to enrich vendor logos.

This command:
1. Maps existing images from Images.json to vendors
2. Copies/organizes logo files
3. Updates vendor logo paths in database

Usage:
    python manage.py enrich_vendor_logos --dry-run
    python manage.py enrich_vendor_logos --limit=10
    python manage.py enrich_vendor_logos
"""

from django.core.management.base import BaseCommand
from apps.hollander.models import Vendor, LegacyAccount
from django.db import transaction
import json
import os
import shutil
from pathlib import Path


class Command(BaseCommand):
    help = 'Enrich vendor logos by mapping Images.json and organizing logo files'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be changed without making actual changes',
        )
        parser.add_argument(
            '--limit',
            type=int,
            help='Limit processing to N vendors (for testing)',
        )
        parser.add_argument(
            '--source-images',
            type=str,
            default='c:/Users/saksa/Videos/jynm_json/jynm_json/Images.json',
            help='Path to Images.json file',
        )
        parser.add_argument(
            '--source-accounts',
            type=str,
            default='c:/Users/saksa/Videos/jynm_json/jynm_json/Accounts.json',
            help='Path to Accounts.json file',
        )
        parser.add_argument(
            '--legacy-images-dir',
            type=str,
            default='c:/Users/saksa/OneDrive/Desktop/jynm/picture_library',
            help='Path to legacy images directory',
        )

    def handle(self, *args, **options):
        self.dry_run = options['dry_run']
        self.limit = options['limit']
        
        self.stdout.write(self.style.SUCCESS('=' * 80))
        self.stdout.write(self.style.SUCCESS('VENDOR LOGO ENRICHMENT'))
        if self.dry_run:
            self.stdout.write(self.style.WARNING('[DRY RUN MODE - No changes will be made]'))
        self.stdout.write(self.style.SUCCESS('=' * 80))
        self.stdout.write('')

        # Load source data
        self.stdout.write('Loading source data...')
        images_data = self._load_json(options['source_images'])
        accounts_data = self._load_json(options['source_accounts'])
        
        self.stdout.write(f"  Loaded {len(images_data)} images")
        self.stdout.write(f"  Loaded {len(accounts_data)} accounts")
        self.stdout.write('')

        # Create image mapping: accountID -> image filename
        self.stdout.write('Creating image mapping...')
        account_images = {}
        for img in images_data:
            # imageCategoryID == 1 means vendor/account images
            if img.get('imageCategoryID') == '1' and img.get('imageDeleted') == '0':
                target_id = img.get('imageTargetID')
                filename = img.get('imageFileName')
                if target_id and filename:
                    # Store the most recent image for each account
                    if target_id not in account_images:
                        account_images[target_id] = filename
        
        self.stdout.write(f"  Found {len(account_images)} account images")
        self.stdout.write('')

        # Create account mapping: accountID -> accountName
        self.stdout.write('Creating account name mapping...')
        account_names = {}
        for acc in accounts_data:
            acc_id = acc.get('accountID')
            acc_name = acc.get('accountName', '')
            if acc_id and acc_name:
                account_names[acc_id] = acc_name
        
        self.stdout.write(f"  Mapped {len(account_names)} account names")
        self.stdout.write('')

        # Setup directories
        legacy_images_dir = Path(options['legacy_images_dir'])
        frontend_public_dir = Path('c:/Users/saksa/OneDrive/Desktop/junkyard/junkyard/frontend/public')
        vendor_logos_dir = frontend_public_dir / 'images' / 'vendors' / 'logos'
        
        if not self.dry_run:
            vendor_logos_dir.mkdir(parents=True, exist_ok=True)
            self.stdout.write(f"Created logo directory: {vendor_logos_dir}")
            self.stdout.write('')

        # Process vendors
        self.stdout.write('Processing vendors...')
        self.stdout.write('-' * 80)
        
        vendors = Vendor.objects.all().order_by('id')
        if self.limit:
            vendors = vendors[:self.limit]
        
        stats = {
            'total': 0,
            'mapped_from_images': 0,
            'kept_placeholder': 0,
            'errors': 0
        }

        for vendor in vendors:
            stats['total'] += 1
            
            try:
                # Try to find matching account by yard_id
                account_id = str(vendor.yard_id)
                
                # Check if we have an image for this account
                if account_id in account_images:
                    image_filename = account_images[account_id]
                    source_path = legacy_images_dir / image_filename
                    
                    if source_path.exists():
                        # Copy to new location
                        # Use vendor ID in filename to avoid conflicts
                        file_ext = source_path.suffix
                        new_filename = f"vendor_{vendor.id}_{vendor.yard_id}{file_ext}"
                        dest_path = vendor_logos_dir / new_filename
                        
                        if not self.dry_run:
                            shutil.copy2(source_path, dest_path)
                        
                        # Update vendor logo path
                        new_logo_path = f"/images/vendors/logos/{new_filename}"
                        
                        if not self.dry_run:
                            vendor.logo = new_logo_path
                            if hasattr(vendor, 'logo_source'):
                                vendor.logo_source = 'original'
                            vendor.save(update_fields=['logo'])
                        
                        stats['mapped_from_images'] += 1
                        self.stdout.write(f"  ✓ {vendor.name[:50]:50} -> {new_filename}")
                    else:
                        self.stdout.write(f"  ⚠ {vendor.name[:50]:50} -> Image file not found: {image_filename}")
                        stats['kept_placeholder'] += 1
                else:
                    # No image found, keep placeholder
                    stats['kept_placeholder'] += 1
                    if stats['kept_placeholder'] <= 5:  # Only show first 5
                        self.stdout.write(f"  - {vendor.name[:50]:50} -> No image found")
                    
            except Exception as e:
                stats['errors'] += 1
                self.stdout.write(self.style.ERROR(f"  ✗ Error processing {vendor.name}: {str(e)}"))

        # Summary
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('=' * 80))
        self.stdout.write(self.style.SUCCESS('LOGO ENRICHMENT SUMMARY'))
        self.stdout.write(self.style.SUCCESS('=' * 80))
        self.stdout.write(f"Total vendors processed: {stats['total']}")
        self.stdout.write(f"  ✓ Logos mapped from Images.json: {stats['mapped_from_images']}")
        self.stdout.write(f"  - Kept placeholder: {stats['kept_placeholder']}")
        self.stdout.write(f"  ✗ Errors: {stats['errors']}")
        self.stdout.write('')
        
        if self.dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN COMPLETE - No changes were made'))
            self.stdout.write('Run without --dry-run to apply changes')
        else:
            self.stdout.write(self.style.SUCCESS('✓ Logo enrichment complete!'))

    def _load_json(self, filepath):
        """Load JSON file"""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error loading {filepath}: {str(e)}"))
            return []
