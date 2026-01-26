"""
Django management command to import vendor data from JSON files.

Usage:
    python manage.py import_vendors --file1 path/to/vendors_part_1.json --file2 path/to/vendors_part_2.json
    python manage.py import_vendors --file1 path/to/vendors_part_1.json --file2 path/to/vendors_part_2.json --dry-run
    python manage.py import_vendors --file1 path/to/vendors_part_1.json --file2 path/to/vendors_part_2.json --verbose
"""

from django.core.management.base import BaseCommand, CommandError
from apps.hollander.models import Vendor
import json
from datetime import datetime
from collections import defaultdict


class Command(BaseCommand):
    help = 'Import vendor data from JSON files with deduplication'

    def add_arguments(self, parser):
        parser.add_argument(
            '--file1',
            type=str,
            required=True,
            help='Path to first vendor JSON file (vendors_part_1.json)',
        )
        parser.add_argument(
            '--file2',
            type=str,
            required=True,
            help='Path to second vendor JSON file (vendors_part_2.json)',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Preview changes without saving to database',
        )
        parser.add_argument(
            '--verbose',
            action='store_true',
            help='Show detailed processing information',
        )

    def handle(self, *args, **options):
        self.dry_run = options['dry_run']
        self.verbose = options['verbose']
        
        self.stdout.write(self.style.SUCCESS('=' * 80))
        self.stdout.write(self.style.SUCCESS('VENDOR DATA IMPORT'))
        if self.dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN MODE - No changes will be saved'))
        self.stdout.write(self.style.SUCCESS('=' * 80))
        self.stdout.write('')

        # Statistics
        self.stats = {
            'total_processed': 0,
            'created': 0,
            'updated': 0,
            'skipped': 0,
            'errors': 0,
            'duplicates_in_files': 0,
        }
        self.errors = []

        # Load and merge vendor data
        vendors_data = self._load_and_merge_vendors(options['file1'], options['file2'])
        
        if not vendors_data:
            self.stdout.write(self.style.ERROR('No vendor data to import'))
            return

        self.stdout.write(f"Total unique vendors to process: {len(vendors_data)}")
        self.stdout.write('')

        # Process each vendor
        self.stdout.write(self.style.WARNING('Processing vendors...'))
        self.stdout.write('-' * 80)
        
        for yard_id, vendor_data in vendors_data.items():
            self._process_vendor(yard_id, vendor_data)

        # Display results
        self._display_results()

    def _load_and_merge_vendors(self, file1_path, file2_path):
        """Load both JSON files and merge vendors, deduplicating by accountID"""
        vendors = {}
        
        # Load file 1
        self.stdout.write(f"Loading vendors from: {file1_path}")
        try:
            with open(file1_path, 'r', encoding='utf-8') as f:
                # Read first line to detect format
                first_line = f.readline().strip()
                f.seek(0)
                
                self.stdout.write(f"  DEBUG: First line starts with '[': {first_line.startswith('[')}")
                self.stdout.write(f"  DEBUG: First line starts with '{{': {first_line.startswith('{')}")
                
                # Check if it's NDJSON (starts with {) or JSON array (starts with [)
                if first_line.startswith('['):
                    # JSON array format
                    self.stdout.write("  DEBUG: Using JSON array format")
                    data1 = json.load(f)
                else:
                    # NDJSON format - each line is a separate JSON object
                    self.stdout.write("  DEBUG: Using NDJSON format")
                    data1 = []
                    line_num = 0
                    skipped_lines = 0
                    for line in f:
                        line_num += 1
                        line = line.strip()
                        if line:
                            try:
                                data1.append(json.loads(line))
                            except json.JSONDecodeError as e:
                                skipped_lines += 1
                                if self.verbose:
                                    self.stdout.write(self.style.WARNING(
                                        f"    WARNING: Skipping malformed JSON at line {line_num}: {e.msg}"
                                    ))
                    
                    if skipped_lines > 0:
                        self.stdout.write(self.style.WARNING(
                            f"  WARNING: Skipped {skipped_lines} malformed lines in file 1"
                        ))
                
                self.stdout.write(f"  OK: Loaded {len(data1)} vendors from file 1")
                
                for vendor in data1:
                    account_id = vendor.get('accountID')
                    if account_id:
                        vendors[account_id] = vendor
        except FileNotFoundError:
            raise CommandError(f"File not found: {file1_path}")
        except json.JSONDecodeError as e:
            raise CommandError(f"Invalid JSON in file 1: {e}")
        except Exception as e:
            raise CommandError(f"Error loading file 1: {e}")

        file1_count = len(vendors)

        # Load file 2
        self.stdout.write(f"Loading vendors from: {file2_path}")
        try:
            with open(file2_path, 'r', encoding='utf-8') as f:
                # Read first line to detect format
                first_line = f.readline().strip()
                f.seek(0)
                
                # Check if it's NDJSON (starts with {) or JSON array (starts with [)
                if first_line.startswith('['):
                    # JSON array format
                    data2 = json.load(f)
                else:
                    # NDJSON format - each line is a separate JSON object
                    data2 = []
                    line_num = 0
                    skipped_lines = 0
                    for line in f:
                        line_num += 1
                        line = line.strip()
                        if line:
                            try:
                                data2.append(json.loads(line))
                            except json.JSONDecodeError as e:
                                skipped_lines += 1
                                if self.verbose:
                                    self.stdout.write(self.style.WARNING(
                                        f"    WARNING: Skipping malformed JSON at line {line_num}: {e.msg}"
                                    ))
                    
                    if skipped_lines > 0:
                        self.stdout.write(self.style.WARNING(
                            f"  WARNING: Skipped {skipped_lines} malformed lines in file 2"
                        ))
                
                self.stdout.write(f"  OK: Loaded {len(data2)} vendors from file 2")
                
                for vendor in data2:
                    account_id = vendor.get('accountID')
                    if account_id:
                        if account_id in vendors:
                            # Duplicate found - merge data (prefer non-empty values)
                            self.stats['duplicates_in_files'] += 1
                            vendors[account_id] = self._merge_vendor_data(
                                vendors[account_id], 
                                vendor
                            )
                        else:
                            vendors[account_id] = vendor
        except FileNotFoundError:
            raise CommandError(f"File not found: {file2_path}")
        except json.JSONDecodeError as e:
            raise CommandError(f"Invalid JSON in file 2: {e}")
        except Exception as e:
            raise CommandError(f"Error loading file 2: {e}")

        file2_unique = len(vendors) - file1_count
        
        self.stdout.write('')
        self.stdout.write(f"Summary:")
        self.stdout.write(f"  - Vendors from file 1: {file1_count}")
        self.stdout.write(f"  - New vendors from file 2: {file2_unique}")
        self.stdout.write(f"  - Duplicates across files: {self.stats['duplicates_in_files']}")
        self.stdout.write(f"  - Total unique vendors: {len(vendors)}")
        self.stdout.write('')

        return vendors

    def _merge_vendor_data(self, existing, new):
        """Merge two vendor records, preferring non-empty values"""
        merged = existing.copy()
        
        for key, value in new.items():
            # If existing value is empty/null and new value is not, use new value
            if not existing.get(key) and value:
                merged[key] = value
        
        return merged

    def _process_vendor(self, yard_id, vendor_data):
        """Process a single vendor record"""
        self.stats['total_processed'] += 1
        
        try:
            # Validate required fields
            if not self._validate_vendor(yard_id, vendor_data):
                self.stats['skipped'] += 1
                return

            # Map JSON fields to model fields
            vendor_fields = self._map_vendor_fields(yard_id, vendor_data)

            if self.verbose:
                self.stdout.write(f"  Processing: {vendor_fields['name']} (yard_id: {yard_id})")

            # Save to database (unless dry run)
            if not self.dry_run:
                vendor, created = Vendor.objects.update_or_create(
                    yard_id=yard_id,
                    defaults=vendor_fields
                )
                
                if created:
                    self.stats['created'] += 1
                    if self.verbose:
                        self.stdout.write(self.style.SUCCESS(f"    ✓ Created vendor: {vendor.name}"))
                else:
                    self.stats['updated'] += 1
                    if self.verbose:
                        self.stdout.write(self.style.WARNING(f"    ↻ Updated vendor: {vendor.name}"))
            else:
                # Dry run - check if vendor exists
                exists = Vendor.objects.filter(yard_id=yard_id).exists()
                if exists:
                    self.stats['updated'] += 1
                    if self.verbose:
                        self.stdout.write(self.style.WARNING(f"    [DRY RUN] Would update: {vendor_fields['name']}"))
                else:
                    self.stats['created'] += 1
                    if self.verbose:
                        self.stdout.write(self.style.SUCCESS(f"    [DRY RUN] Would create: {vendor_fields['name']}"))

        except Exception as e:
            self.stats['errors'] += 1
            error_msg = f"Error processing vendor {yard_id}: {str(e)}"
            self.errors.append(error_msg)
            self.stdout.write(self.style.ERROR(f"  ✗ {error_msg}"))

    def _validate_vendor(self, yard_id, vendor_data):
        """Validate vendor data has required fields"""
        # Check yard_id
        if not yard_id:
            self.errors.append("Vendor missing accountID")
            return False

        # Check required fields
        required_fields = ['accountName', 'city', 'state', 'zip']
        missing_fields = []
        
        for field in required_fields:
            if not vendor_data.get(field):
                missing_fields.append(field)
        
        if missing_fields:
            error_msg = f"Vendor {yard_id} missing required fields: {', '.join(missing_fields)}"
            self.errors.append(error_msg)
            if self.verbose:
                self.stdout.write(self.style.ERROR(f"  ✗ {error_msg}"))
            return False

        return True

    def _map_vendor_fields(self, yard_id, vendor_data):
        """Map JSON fields to Vendor model fields"""
        return {
            'name': vendor_data.get('accountName', '').strip(),
            'address': vendor_data.get('addressStreet', '').strip(),
            'city': vendor_data.get('city', '').strip(),
            'state': vendor_data.get('state', '').strip(),
            'zip_code': vendor_data.get('zip', '').strip(),
            'phone': vendor_data.get('phone', '').strip(),
            'email': vendor_data.get('email', '').strip(),
            'website': vendor_data.get('website', '').strip(),
            # Keep existing values for fields not in JSON
            # These will be preserved if vendor already exists
        }

    def _display_results(self):
        """Display import results"""
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('=' * 80))
        self.stdout.write(self.style.SUCCESS('IMPORT COMPLETE'))
        self.stdout.write(self.style.SUCCESS('=' * 80))
        self.stdout.write('')
        
        # Statistics
        self.stdout.write(self.style.WARNING('STATISTICS:'))
        self.stdout.write('-' * 80)
        self.stdout.write(f"  Total vendors processed: {self.stats['total_processed']}")
        self.stdout.write(self.style.SUCCESS(f"  OK: Vendors created: {self.stats['created']}"))
        self.stdout.write(self.style.WARNING(f"  UPDATED: Vendors updated: {self.stats['updated']}"))
        self.stdout.write(f"  SKIPPED: Vendors skipped: {self.stats['skipped']}")
        self.stdout.write(self.style.ERROR(f"  ERROR: Errors: {self.stats['errors']}"))
        self.stdout.write('')

        # Show errors if any
        if self.errors:
            self.stdout.write(self.style.ERROR('ERRORS:'))
            self.stdout.write('-' * 80)
            for error in self.errors[:10]:  # Show first 10 errors
                self.stdout.write(f"  - {error}")
            if len(self.errors) > 10:
                self.stdout.write(f"  ... and {len(self.errors) - 10} more errors")
            self.stdout.write('')

        # Success message
        if self.stats['errors'] == 0:
            if self.dry_run:
                self.stdout.write(self.style.SUCCESS('OK: Dry run completed successfully!'))
                self.stdout.write(self.style.WARNING('  Run without --dry-run to save changes to database'))
            else:
                self.stdout.write(self.style.SUCCESS('OK: Import completed successfully!'))
                self.stdout.write('')
                self.stdout.write(self.style.WARNING('NEXT STEPS:'))
                self.stdout.write('  1. Verify vendors in admin portal: /admin/vendors')
                self.stdout.write('  2. Verify vendors on website: /vendors')
                self.stdout.write('  3. Run data quality audit: python manage.py audit_vendor_data')
                self.stdout.write('  4. Enrich vendor logos: python manage.py enrich_vendor_logos')
                self.stdout.write('  5. Enrich vendor descriptions: python manage.py enrich_vendor_descriptions')
        else:
            self.stdout.write(self.style.ERROR(f'WARNING: Import completed with {self.stats["errors"]} errors'))
            self.stdout.write(self.style.WARNING('  Review errors above and fix data issues'))
