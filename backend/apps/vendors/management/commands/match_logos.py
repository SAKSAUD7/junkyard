"""
Match vendor logos from frontend to database vendors
"""
from django.core.management.base import BaseCommand
from apps.vendors.models import Vendor
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
        
        # Try exact match
        for ext in ['.png', '.jpg', '.jpeg', '.gif', '.webp']:
            exact_match = f"{normalized}{ext}"
            if exact_match in files:
                return f"/images/vendors/{exact_match}"
        
        # Try case-insensitive match
        normalized_lower = normalized.lower()
        for filename in files:
            file_lower = filename.lower()
            name_part = os.path.splitext(file_lower)[0]
            
            if name_part == normalized_lower:
                return f"/images/vendors/{filename}"
        
        # Try partial match for substantial names
        if len(normalized) > 10:
            for filename in files:
                file_lower = filename.lower()
                name_part = os.path.splitext(file_lower)[0]
                
                if normalized_lower in name_part or name_part in normalized_lower:
                    overlap = len(set(normalized_lower.split('-')) & set(name_part.split('-')))
                    total_words = len(set(normalized_lower.split('-')))
                    
                    if total_words > 0 and (overlap / total_words) >= 0.6:
                        return f"/images/vendors/{filename}"
        
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
        self.stdout.write(self.style.SUCCESS("VENDOR LOGO MATCHING - DATABASE-FIRST APPROACH"))
        self.stdout.write("=" * 80)
        self.stdout.write("")
        
        vendors = Vendor.objects.all()
        total_vendors = vendors.count()
        
        self.stdout.write(f"Total vendors in database: {total_vendors}")
        self.stdout.write(f"Logo directory: {logos_dir}")
        self.stdout.write(f"Mode: {'DRY RUN' if dry_run else 'APPLY CHANGES'}")
        self.stdout.write("")
        
        if not os.path.exists(logos_dir):
            self.stdout.write(self.style.ERROR(f"ERROR: Logo directory not found: {logos_dir}"))
            return
        
        try:
            logo_files = [f for f in os.listdir(logos_dir) if os.path.isfile(os.path.join(logos_dir, f))]
            self.stdout.write(f"Total logo files available: {len(logo_files)}")
            self.stdout.write("")
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error reading directory: {e}"))
            return
        
        matched = 0
        not_matched = 0
        already_has_logo = 0
        updated = 0
        
        self.stdout.write("Processing vendors...")
        self.stdout.write("")
        
        for vendor in vendors:
            if vendor.logo and vendor.logo != "/images/logo-placeholder.png":
                already_has_logo += 1
                continue
            
            logo_path = self.find_logo_file(vendor.name, logos_dir)
            
            if logo_path:
                matched += 1
                self.stdout.write(self.style.SUCCESS(f"[MATCH] {vendor.name}"))
                self.stdout.write(f"   -> {logo_path}")
                
                if not dry_run:
                    vendor.logo = logo_path
                    vendor.save(update_fields=['logo'])
                    updated += 1
            else:
                not_matched += 1
                if not_matched <= 10:
                    self.stdout.write(self.style.WARNING(f"[NO MATCH] {vendor.name}"))
                    self.stdout.write(f"   Normalized: {self.normalize_name(vendor.name)}")
        
        self.stdout.write("")
        self.stdout.write("=" * 80)
        self.stdout.write(self.style.SUCCESS("SUMMARY"))
        self.stdout.write("=" * 80)
        self.stdout.write(f"Total vendors processed:     {total_vendors}")
        self.stdout.write(f"Already had custom logo:     {already_has_logo}")
        self.stdout.write(f"Logos successfully matched:  {matched}")
        self.stdout.write(f"Vendors without match:       {not_matched}")
        
        if dry_run:
            self.stdout.write("")
            self.stdout.write(self.style.WARNING("DRY RUN MODE - No changes were made"))
            self.stdout.write("   Run with --apply to update database")
        else:
            self.stdout.write("")
            self.stdout.write(self.style.SUCCESS(f"Database updated: {updated} vendors"))
        
        self.stdout.write("")
        self.stdout.write(f"Match rate: {(matched / total_vendors * 100):.1f}%")
        self.stdout.write(f"Unused images: {len(logo_files) - matched} (ignored)")
        self.stdout.write("")
