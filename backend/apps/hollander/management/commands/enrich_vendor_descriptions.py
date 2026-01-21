"""
Django management command to enrich vendor descriptions.

This command:
1. Extracts descriptions from Accounts.json
2. Cleans and normalizes HTML content
3. Generates descriptions for vendors without them
4. Updates vendor description fields

Usage:
    python manage.py enrich_vendor_descriptions --dry-run
    python manage.py enrich_vendor_descriptions --limit=10
    python manage.py enrich_vendor_descriptions
"""

from django.core.management.base import BaseCommand
from apps.hollander.models import Vendor
from django.db import transaction
import json
import re
from html.parser import HTMLParser


class HTMLStripper(HTMLParser):
    """Simple HTML tag stripper"""
    def __init__(self):
        super().__init__()
        self.reset()
        self.strict = False
        self.convert_charrefs= True
        self.text = []
    
    def handle_data(self, data):
        self.text.append(data)
    
    def get_data(self):
        return ''.join(self.text)


class Command(BaseCommand):
    help = 'Enrich vendor descriptions from Accounts.json'

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
            '--source-accounts',
            type=str,
            default='c:/Users/saksa/Videos/jynm_json/jynm_json/Accounts.json',
            help='Path to Accounts.json file',
        )

    def handle(self, *args, **options):
        self.dry_run = options['dry_run']
        self.limit = options['limit']
        
        self.stdout.write(self.style.SUCCESS('=' * 80))
        self.stdout.write(self.style.SUCCESS('VENDOR DESCRIPTION ENRICHMENT'))
        if self.dry_run:
            self.stdout.write(self.style.WARNING('[DRY RUN MODE - No changes will be made]'))
        self.stdout.write(self.style.SUCCESS('=' * 80))
        self.stdout.write('')

        # Load source data
        self.stdout.write('Loading Accounts.json...')
        accounts_data = self._load_json(options['source_accounts'])
        self.stdout.write(f"  Loaded {len(accounts_data)} accounts")
        self.stdout.write('')

        # Create description mapping: accountID -> description
        self.stdout.write('Extracting descriptions from accounts...')
        account_descriptions = {}
        for acc in accounts_data:
            acc_id = acc.get('accountID')
            description = acc.get('accountProfileDescription', '')
            
            if acc_id and description and description.strip():
                # Clean the description
                cleaned = self._clean_description(description)
                if cleaned and len(cleaned) > 20:  # Only keep meaningful descriptions
                    account_descriptions[acc_id] = cleaned
        
        self.stdout.write(f"  Found {len(account_descriptions)} accounts with descriptions")
        self.stdout.write('')

        # Process vendors
        self.stdout.write('Processing vendors...')
        self.stdout.write('-' * 80)
        
        vendors = Vendor.objects.all().order_by('id')
        if self.limit:
            vendors = vendors[:self.limit]
        
        stats = {
            'total': 0,
            'updated_from_accounts': 0,
            'generated_new': 0,
            'already_had_description': 0,
            'errors': 0
        }

        for vendor in vendors:
            stats['total'] += 1
            
            try:
                # Skip if vendor already has a good description
                if vendor.description and len(vendor.description) > 50:
                    stats['already_had_description'] += 1
                    continue
                
                # Try to find matching account by yard_id
                account_id = str(vendor.yard_id)
                
                if account_id in account_descriptions:
                    # Use description from Accounts.json
                    new_description = account_descriptions[account_id]
                    
                    if not self.dry_run:
                        vendor.description = new_description
                        if hasattr(vendor, 'description_source'):
                            vendor.description_source = 'original'
                        vendor.save(update_fields=['description'])
                    
                    stats['updated_from_accounts'] += 1
                    preview = new_description[:80] + '...' if len(new_description) > 80 else new_description
                    self.stdout.write(f"  ✓ {vendor.name[:40]:40} -> {preview}")
                else:
                    # Generate a basic description
                    generated_description = self._generate_description(vendor)
                    
                    if not self.dry_run:
                        vendor.description = generated_description
                        if hasattr(vendor, 'description_source'):
                            vendor.description_source = 'generated'
                        vendor.save(update_fields=['description'])
                    
                    stats['generated_new'] += 1
                    if stats['generated_new'] <= 10:  # Show first 10 generated
                        self.stdout.write(f"  + {vendor.name[:40]:40} -> [Generated]")
                    
            except Exception as e:
                stats['errors'] += 1
                self.stdout.write(self.style.ERROR(f"  ✗ Error processing {vendor.name}: {str(e)}"))

        # Summary
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('=' * 80))
        self.stdout.write(self.style.SUCCESS('DESCRIPTION ENRICHMENT SUMMARY'))
        self.stdout.write(self.style.SUCCESS('=' * 80))
        self.stdout.write(f"Total vendors processed: {stats['total']}")
        self.stdout.write(f"  ✓ Updated from Accounts.json: {stats['updated_from_accounts']}")
        self.stdout.write(f"  + Generated new descriptions: {stats['generated_new']}")
        self.stdout.write(f"  - Already had description: {stats['already_had_description']}")
        self.stdout.write(f"  ✗ Errors: {stats['errors']}")
        self.stdout.write('')
        
        if self.dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN COMPLETE - No changes were made'))
            self.stdout.write('Run without --dry-run to apply changes')
        else:
            self.stdout.write(self.style.SUCCESS('✓ Description enrichment complete!'))

    def _load_json(self, filepath):
        """Load JSON file"""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error loading {filepath}: {str(e)}"))
            return []

    def _clean_description(self, html_text):
        """Clean HTML and normalize text"""
        if not html_text:
            return ''
        
        # Strip HTML tags
        stripper = HTMLStripper()
        try:
            stripper.feed(html_text)
            text = stripper.get_data()
        except:
            # Fallback: simple regex strip
            text = re.sub(r'<[^>]+>', '', html_text)
        
        # Clean up whitespace
        text = re.sub(r'\s+', ' ', text)
        text = text.strip()
        
        # Decode common HTML entities
        text = text.replace('&amp;', '&')
        text = text.replace('&nbsp;', ' ')
        text = text.replace('&middot;', '·')
        text = text.replace('&lt;', '<')
        text = text.replace('&gt;', '>')
        
        return text

    def _generate_description(self, vendor):
        """Generate a basic description for vendors without one"""
        parts = []
        
        # Start with name and location
        parts.append(f"{vendor.name} is an auto salvage yard")
        
        if vendor.city and vendor.state:
            parts.append(f"located in {vendor.city}, {vendor.state}")
        elif vendor.state:
            parts.append(f"located in {vendor.state}")
        
        # Add generic service description
        parts.append("offering quality used auto parts and recycling services")
        
        # Combine into sentence
        description = ' '.join(parts) + '.'
        
        # Add contact info if available
        if vendor.phone:
            description += f" Contact them at {vendor.phone} for parts inquiries."
        
        return description
