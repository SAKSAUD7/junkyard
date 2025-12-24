"""
Intelligent Logo Matcher - Multi-Strategy Approach
===================================================

This script attempts to match vendor logos using multiple strategies:
1. Check if logo filename contains vendor name fragments
2. Fuzzy matching on normalized names
3. Check for common patterns (state codes, city names)
4. Generate confidence scores for matches

Usage:
    python manage.py smart_match_logos
    python manage.py smart_match_logos --apply --min-confidence 80
"""

from django.core.management.base import BaseCommand
from apps.vendors.models import Vendor
from django.conf import settings
from pathlib import Path
import os
import re
from difflib import SequenceMatcher

class Command(BaseCommand):
    help = 'Intelligently match vendor logos using multiple strategies'

    def add_arguments(self, parser):
        parser.add_argument(
            '--apply',
            action='store_true',
            help='Actually update the database',
        )
        parser.add_argument(
            '--min-confidence',
            type=int,
            default=70,
            help='Minimum confidence score (0-100) to accept a match',
        )
        parser.add_argument(
            '--show-all',
            action='store_true',
            help='Show all potential matches, not just best ones',
        )

    def normalize_for_matching(self, text):
        """Normalize text for matching"""
        if not text:
            return ""
        # Convert to lowercase
        text = text.lower()
        # Remove common business suffixes
        text = re.sub(r'\b(inc|llc|corp|company|co|ltd|limited)\b', '', text)
        # Remove possessives
        text = text.replace("'s", "").replace("'", "")
        # Remove special characters
        text = re.sub(r'[^a-z0-9\s]', '', text)
        # Replace multiple spaces with single space
        text = re.sub(r'\s+', ' ', text)
        return text.strip()

    def extract_keywords(self, text):
        """Extract meaningful keywords from text"""
        normalized = self.normalize_for_matching(text)
        # Remove common words
        stop_words = {'auto', 'parts', 'salvage', 'used', 'junk', 'yard', 'recycling', 'the', 'and', 'of'}
        words = [w for w in normalized.split() if w not in stop_words and len(w) > 2]
        return words

    def similarity_score(self, str1, str2):
        """Calculate similarity between two strings (0-100)"""
        return int(SequenceMatcher(None, str1.lower(), str2.lower()).ratio() * 100)

    def calculate_match_confidence(self, vendor, filename):
        """Calculate confidence score for a vendor-filename match"""
        score = 0
        reasons = []
        
        # Remove extension
        filename_base = os.path.splitext(filename)[0].lower()
        vendor_normalized = self.normalize_for_matching(vendor.name)
        
        # Strategy 1: Direct substring match
        if vendor_normalized in filename_base or filename_base in vendor_normalized:
            score += 40
            reasons.append("Direct substring match")
        
        # Strategy 2: Keyword matching
        vendor_keywords = self.extract_keywords(vendor.name)
        filename_keywords = self.extract_keywords(filename_base.replace('-', ' '))
        
        matching_keywords = set(vendor_keywords) & set(filename_keywords)
        if matching_keywords:
            keyword_score = (len(matching_keywords) / max(len(vendor_keywords), 1)) * 30
            score += keyword_score
            reasons.append(f"Keywords match: {', '.join(matching_keywords)}")
        
        # Strategy 3: City/State in filename
        if vendor.city.lower() in filename_base:
            score += 15
            reasons.append(f"City match ({vendor.city})")
        
        if vendor.state.lower() in filename_base:
            score += 10
            reasons.append(f"State match ({vendor.state})")
        
        # Strategy 4: Fuzzy similarity
        similarity = self.similarity_score(vendor_normalized, filename_base)
        if similarity > 50:
            score += (similarity - 50) / 2  # Up to 25 points
            reasons.append(f"Fuzzy similarity: {similarity}%")
        
        # Strategy 5: First letters match
        vendor_initials = ''.join([w[0] for w in vendor.name.split() if w])
        if vendor_initials.lower() in filename_base:
            score += 10
            reasons.append(f"Initials match ({vendor_initials})")
        
        return min(int(score), 100), reasons

    def find_best_match(self, vendor, logo_files):
        """Find best matching logo file for a vendor"""
        best_match = None
        best_score = 0
        best_reasons = []
        
        for filename in logo_files:
            score, reasons = self.calculate_match_confidence(vendor, filename)
            if score > best_score:
                best_score = score
                best_match = filename
                best_reasons = reasons
        
        return best_match, best_score, best_reasons

    def handle(self, *args, **options):
        dry_run = not options['apply']
        min_confidence = options['min_confidence']
        show_all = options['show_all']
        
        # Get paths
        backend_dir = Path(settings.BASE_DIR)
        project_root = backend_dir.parent
        logos_dir = project_root / 'frontend' / 'public' / 'images' / 'vendors'
        
        self.stdout.write("=" * 80)
        self.stdout.write(self.style.SUCCESS("INTELLIGENT LOGO MATCHER - MULTI-STRATEGY APPROACH"))
        self.stdout.write("=" * 80)
        self.stdout.write("")
        
        if not logos_dir.exists():
            self.stdout.write(self.style.ERROR(f"ERROR: Logo directory not found: {logos_dir}"))
            return
        
        # Get all logo files
        try:
            logo_files = [f for f in os.listdir(logos_dir) if os.path.isfile(os.path.join(logos_dir, f))]
            self.stdout.write(f"Logo files available: {len(logo_files)}")
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"ERROR: {e}"))
            return
        
        # Get vendors
        vendors = Vendor.objects.filter(logo='/images/logo-placeholder.png')
        total_vendors = vendors.count()
        
        self.stdout.write(f"Vendors to process: {total_vendors}")
        self.stdout.write(f"Minimum confidence: {min_confidence}%")
        self.stdout.write(f"Mode: {'APPLY CHANGES' if not dry_run else 'DRY RUN'}")
        self.stdout.write("")
        
        # Statistics
        high_confidence = 0  # 80-100%
        medium_confidence = 0  # 60-79%
        low_confidence = 0  # 40-59%
        no_match = 0  # <40%
        updated = 0
        
        matches = []
        
        self.stdout.write("Processing vendors...")
        self.stdout.write("")
        
        for vendor in vendors:
            best_file, confidence, reasons = self.find_best_match(vendor, logo_files)
            
            if confidence >= min_confidence:
                logo_path = f"/images/vendors/{best_file}"
                matches.append({
                    'vendor': vendor,
                    'file': best_file,
                    'confidence': confidence,
                    'reasons': reasons
                })
                
                if confidence >= 80:
                    high_confidence += 1
                    status = self.style.SUCCESS(f"[HIGH {confidence}%]")
                elif confidence >= 60:
                    medium_confidence += 1
                    status = self.style.WARNING(f"[MED {confidence}%]")
                else:
                    low_confidence += 1
                    status = self.style.WARNING(f"[LOW {confidence}%]")
                
                self.stdout.write(f"{status} {vendor.name}")
                self.stdout.write(f"   -> {best_file}")
                if show_all:
                    for reason in reasons:
                        self.stdout.write(f"      * {reason}")
                
                if not dry_run:
                    vendor.logo = logo_path
                    vendor.save(update_fields=['logo'])
                    updated += 1
            else:
                no_match += 1
                if no_match <= 5:  # Show first 5
                    self.stdout.write(f"[NO MATCH {confidence}%] {vendor.name}")
        
        # Summary
        self.stdout.write("")
        self.stdout.write("=" * 80)
        self.stdout.write(self.style.SUCCESS("SUMMARY"))
        self.stdout.write("=" * 80)
        self.stdout.write(f"Total vendors processed:     {total_vendors}")
        self.stdout.write(f"High confidence (80-100%):   {high_confidence}")
        self.stdout.write(f"Medium confidence (60-79%):  {medium_confidence}")
        self.stdout.write(f"Low confidence (40-59%):     {low_confidence}")
        self.stdout.write(f"Below threshold (<{min_confidence}%):  {no_match}")
        
        if dry_run:
            self.stdout.write("")
            self.stdout.write(self.style.WARNING("DRY RUN MODE - No changes were made"))
            self.stdout.write(f"   Run with --apply --min-confidence {min_confidence} to update database")
        else:
            self.stdout.write("")
            self.stdout.write(self.style.SUCCESS(f"Database updated: {updated} vendors"))
        
        self.stdout.write("")
        total_matched = high_confidence + medium_confidence + low_confidence
        if total_vendors > 0:
            match_rate = (total_matched / total_vendors) * 100
            self.stdout.write(f"Match rate: {match_rate:.1f}%")
        
        self.stdout.write("")
