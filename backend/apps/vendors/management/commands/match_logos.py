"""
Match vendor logos from frontend to database vendors
"""
from django.core.management.base import BaseCommand
from apps.hollander.models import Vendor
import os
import re
from pathlib import Path

class Command(BaseCommand):
    help = 'Match vendor logos from frontend images to database vendors'

    def add_arguments(self, parser):
        parser.add_argument(
            '--apply',
            action='store_true',
            help='Actually update the database (default is dry-run)',
        )

    def normalize_name(self, name):
        """Normalize vendor name for matching"""
        if not name:
            return ""
        
        normalized = name.lower()
        normalized = normalized.replace("'s", "s").replace("'", "")
        normalized = normalized.replace(" & ", "-").replace("&", "-")
        normalized = re.sub(r'[.,!?;:()\[\]{}]', '', normalized)
        normalized = re.sub(r'[\s_]+', '-', normalized)
        normalized = re.sub(r'-+', '-', normalized)
        normalized = normalized.strip('-')
        
        return normalized

    def find_logo_file(self, vendor_name, logos_dir):
        """Find matching logo file for vendor"""
        if not os.path.exists(logos_dir):
            return None
        
        normalized = self.normalize_name(vendor_name)
        if not normalized:
            return None
        
        try:
            files = os.listdir(logos_dir)
        except Exception:
            return None
        
        # 1. Try exact match on name
        for ext in ['.png', '.jpg', '.jpeg', '.gif', '.webp']:
            exact_match = f"{normalized}{ext}"
            if exact_match in files:
                return f"/images/vendors/{exact_match}"
        
        # 2. Try case-insensitive name match
        normalized_lower = normalized.lower()
        for filename in files:
            file_lower = filename.lower()
            name_part = os.path.splitext(file_lower)[0]
            
            if name_part == normalized_lower:
                return f"/images/vendors/{filename}"
        
        # 3. Try partial name match (careful)
        if len(normalized) > 10:
            for filename in files:
                file_lower = filename.lower()
                name_part = os.path.splitext(file_lower)[0]
                
                # Exclude hashed filenames (long hex strings) from name matching
                if re.match(r'^[a-f0-9]{32,}$', name_part):
                   continue

                if normalized_lower in name_part or name_part in normalized_lower:
                    overlap = len(set(normalized_lower.split('-')) & set(name_part.split('-')))
                    total_words = len(set(normalized_lower.split('-')))
                    
                    if total_words > 0 and (overlap / total_words) >= 0.6:
                        return f"/images/vendors/{filename}"

        # 4. Hashed Filename Match? 
        # If we have a mapping file, we'd use it here.
        # Since we don't, we can't blindly guess hashes.
        # But maybe there is a legacy logic? 
        # For now, we stick to name matching.
        
        return None

    def handle(self, *args, **options):
        dry_run = not options['apply']
        
        # Get logo directory - navigate from backend dir to frontend
        import django
        from django.conf import settings
        backend_dir = Path(settings.BASE_DIR)  # This is the backend directory
        project_root = backend_dir.parent  # Go up to project root (junkyard/)
        logos_dir = project_root / 'frontend' / 'public' / 'images' / 'vendors'
        
        self.stdout.write("=" * 80)
        self.stdout.write(self.style.SUCCESS("VENDOR LOGO MATCHING - V2 REVISED"))
        self.stdout.write("=" * 80)
        
        if not os.path.exists(logos_dir):
             self.stdout.write(self.style.ERROR(f"ERROR: Logo directory not found: {logos_dir}"))
             return

        # Simple file listing to see if we have names or just hashes
        files = os.listdir(logos_dir)
        hashed_count = sum(1 for f in files if re.match(r'^[a-f0-9]{32,}\.', f))
        named_count = len(files) - hashed_count
        
        self.stdout.write(f"Directory: {logos_dir}")
        self.stdout.write(f"Total Files: {len(files)}")
        self.stdout.write(f"  - Hashed/UUID filenames: {hashed_count}")
        self.stdout.write(f"  - Named filenames:       {named_count}")
        
        if named_count == 0:
             self.stdout.write(self.style.WARNING("⚠️ checking for mapping file..."))
             # We need a mapping file if all are hashed.
             # Check if Images.json exists in same dir?
             # Or in backend?
             mapping_files = [f for f in os.listdir(logos_dir) if f.endswith('.json')]
             if mapping_files:
                 self.stdout.write(f"Found JSON mapping candidates: {mapping_files}")

        vendors = Vendor.objects.all()
        total_vendors = vendors.count()
        matched = 0
        updated = 0
        
        self.stdout.write(f"Scanning {total_vendors} vendors...")
        
        for vendor in vendors:
            if vendor.logo and vendor.logo != "/images/logo-placeholder.png":
                continue
            
            logo_path = self.find_logo_file(vendor.name, logos_dir)
            
            if logo_path:
                matched += 1
                if not dry_run:
                    vendor.logo = logo_path
                    vendor.save(update_fields=['logo'])
                    updated += 1
                    
        self.stdout.write("=" * 80)
        self.stdout.write(f"Matched: {matched}")
        self.stdout.write(f"Updated: {updated}")
