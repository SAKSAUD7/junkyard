import os
import shutil
import csv
import argparse
from pathlib import Path
from rapidfuzz import fuzz, process
from django.core.management.base import BaseCommand
from django.conf import settings
from apps.hollander.models import Vendor

class Command(BaseCommand):
    help = 'Match vendor logos to vendors using fuzzy name matching'

    def add_arguments(self, parser):
        parser.add_argument('--source-dir', type=str, required=True, help='Directory containing logo images')
        parser.add_argument('--dest-dir', type=str, default='vendor_logos', help='Destination directory within MEDIA_ROOT')
        parser.add_argument('--min-confidence', type=int, default=90, help='Minimum confidence score for automatic matching')
        parser.add_argument('--dry-run', action='store_true', help='Preview matches without making changes')
        parser.add_argument('--export-report', action='store_true', help='Export matching report to CSV')
        parser.add_argument('--verbose', action='store_true', help='Show detailed output')

    def handle(self, *args, **options):
        source_dir = Path(options['source_dir'])
        dest_rel_path = options['dest_dir']
        dest_dir = Path(settings.MEDIA_ROOT) / dest_rel_path
        min_confidence = options['min_confidence']
        dry_run = options['dry_run']
        export_report = options['export_report']
        verbose = options['verbose']

        if not source_dir.exists():
            self.stderr.write(f"Source directory not found: {source_dir}")
            return

        if not dry_run:
            dest_dir.mkdir(parents=True, exist_ok=True)

        self.stdout.write("Loading vendors...")
        vendors = Vendor.objects.all()
        # Create a dictionary of normalized names to vendor objects
        # We handle normalization on the fly for better matching
        
        self.stdout.write(f"Found {vendors.count()} vendors.")
        
        self.stdout.write("Scanning logo files...")
        logo_files = [f for f in source_dir.glob('*') if f.is_file() and f.suffix.lower() in ['.jpg', '.jpeg', '.png', '.gif', '.webp']]
        self.stdout.write(f"Found {len(logo_files)} logo files.")

        stats = {
            'processed': 0,
            'matched': 0,
            'ambiguous': 0,
            'unmatched': 0,
            'errors': 0
        }

        matches = [] # List of (vendor, logo_file, score, matched_name)

        # Optimization: Pre-process logo filenames? 
        # Actually, since filenames are hashes, we can't normalize them to match vendor names directly unless we have a mapping.
        # WAIT. The user said: "Input: A directory containing ~3000 vendor logo images... Logo files may have: Company name variations..."
        # BUT checking the directory listing earlier, the files are SHA hashes: "0002e1d6b45aefa0401e8242f539e222bc179cd3.jpg"
        # This contradicts "Logo files may have: Company name variations".
        # UNLESS the user implies I should match against the logo *content* (OCR)? No, that's too heavy.
        # OR maybe I misread the file listing.
        # Let me re-read the directory listing from step 208.
        # "0002e1d6b45aefa0401e8242f539e222bc179cd3.jpg"
        # These are definitely hashes.
        # However, the user prompt said: "Logo files may have: Company name variations, Abbreviations... Normalize logo filenames by: Lowercasing..."
        # If the filenames are hashes, normalization is useless.
        # Is there a mapping file?
        # The user said "Match and assign real vendor logo images... Input: A directory containing ~3000 vendor logo images... Logo files may have..."
        
        # KEY INSIGHT: I might have looked at a cache folder or something.
        # Step 203 listing:
        # {"name":"account-logo","isDir":true,"numChildren":1}
        # Step 208 listing of account-logo: filenames are hashes.
        
        # Maybe the filenames ARE hashes and I can't do name matching on them?
        # IF the filenames are hashes, I cannot match them by name.
        # Did the user provide a mapping file? None mentioned.
        # Is it possible the hash corresponds to something?
        # Wait, usually `yard_id` might be in the filename? No.
        # Is it possible the *metadata* of the image contains the name? Unlikely.
        
        # Re-reading prompt: "Normalize logo filenames by: Lowercasing, Removing special characters..."
        # This implies the filenames SHOULD be meaningful.
        # Maybe I looked at the wrong folder? 
        # `c:\Users\saksa\Downloads\Telegram Desktop\ALL_IMAGES\ALL_IMAGES`
        
        # Let's check `assoc-logo` in that directory?
        # Or maybe there are other folders?
        # Step 203 showed: account-logo, account-misc, assoc-logo, payment-logo, resize.
        
        # If `account-logo` has hashes, maybe `resize` or others have names?
        # Or maybe the user *thinks* they are named, but they are hashed.
        # If they are hashed, I CANNOT fulfill the request of "Fuzzy name matching" without a mapping source.
        # UNLESS the hash is of the vendor name?
        # `0002e1d6...` looks like a git object hash or similar.
        
        # IMPORTANT: I need to verify if these hashes are mappable or if I'm blocked.
        # I'll add a check in the command to inspect this, but since I am writing the code now...
        # Copilot/Agent intervention: I should pause writing the file and investigate this discrepancy.
        # If I write the code assuming names, it will fail 100%.
        
        # Cancelling write_to_file to investigate.
        pass
