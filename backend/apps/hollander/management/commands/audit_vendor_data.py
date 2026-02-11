"""
Django management command to audit vendor data completeness.

Usage:
    python manage.py audit_vendor_data
    python manage.py audit_vendor_data --output=audit_report.json
    python manage.py audit_vendor_data --verbose
"""

from django.core.management.base import BaseCommand
from apps.hollander.models import Vendor, VendorRating
from django.db.models import Count, Q
import json
from datetime import datetime


class Command(BaseCommand):
    help = 'Audit vendor data to identify completeness of logos, descriptions, and reviews'

    def add_arguments(self, parser):
        parser.add_argument(
            '--output',
            type=str,
            help='Output file path for JSON report (optional)',
        )
        parser.add_argument(
            '--verbose',
            action='store_true',
            help='Show detailed vendor-by-vendor analysis',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('=' * 80))
        self.stdout.write(self.style.SUCCESS('VENDOR DATA AUDIT'))
        self.stdout.write(self.style.SUCCESS('=' * 80))
        self.stdout.write('')

        # Get all vendors
        total_vendors = Vendor.objects.count()
        active_vendors = Vendor.objects.filter(is_active=True).count()
        
        self.stdout.write(f"Total Vendors: {total_vendors}")
        self.stdout.write(f"Active Vendors: {active_vendors}")
        self.stdout.write('')

        # Audit logos
        self.stdout.write(self.style.WARNING('LOGO AUDIT:'))
        self.stdout.write('-' * 80)
        
        vendors_with_logo = Vendor.objects.exclude(
            Q(logo='') | Q(logo='/images/logo-placeholder.png') | Q(logo__isnull=True)
        ).count()
        vendors_with_placeholder = Vendor.objects.filter(
            logo='/images/logo-placeholder.png'
        ).count()
        vendors_without_logo = Vendor.objects.filter(
            Q(logo='') | Q(logo__isnull=True)
        ).count()
        
        self.stdout.write(f"  ✓ Vendors with real logo: {vendors_with_logo} ({self._percentage(vendors_with_logo, total_vendors)}%)")
        self.stdout.write(f"  ⚠ Vendors with placeholder: {vendors_with_placeholder} ({self._percentage(vendors_with_placeholder, total_vendors)}%)")
        self.stdout.write(f"  ✗ Vendors without logo: {vendors_without_logo} ({self._percentage(vendors_without_logo, total_vendors)}%)")
        self.stdout.write('')

        # Audit descriptions
        self.stdout.write(self.style.WARNING('DESCRIPTION AUDIT:'))
        self.stdout.write('-' * 80)
        
        vendors_with_description = Vendor.objects.exclude(
            Q(description='') | Q(description__isnull=True)
        ).count()
        vendors_without_description = Vendor.objects.filter(
            Q(description='') | Q(description__isnull=True)
        ).count()
        
        # Check description quality (length)
        vendors_with_good_description = Vendor.objects.exclude(
            Q(description='') | Q(description__isnull=True)
        ).filter(description__regex=r'.{100,}').count()  # At least 100 chars
        
        self.stdout.write(f"  ✓ Vendors with description: {vendors_with_description} ({self._percentage(vendors_with_description, total_vendors)}%)")
        self.stdout.write(f"  ✓ Vendors with quality description (100+ chars): {vendors_with_good_description} ({self._percentage(vendors_with_good_description, total_vendors)}%)")
        self.stdout.write(f"  ✗ Vendors without description: {vendors_without_description} ({self._percentage(vendors_without_description, total_vendors)}%)")
        self.stdout.write('')

        # Audit reviews/ratings
        self.stdout.write(self.style.WARNING('REVIEWS/RATINGS AUDIT:'))
        self.stdout.write('-' * 80)
        
        total_ratings = VendorRating.objects.count()
        vendors_with_ratings = Vendor.objects.annotate(
            rating_count=Count('ratings')
        ).filter(rating_count__gt=0).count()
        vendors_without_ratings = total_vendors - vendors_with_ratings
        
        # Check review snippet
        vendors_with_review_snippet = Vendor.objects.exclude(
            Q(review_snippet='') | Q(review_snippet__isnull=True)
        ).count()
        
        # Check rating fields
        vendors_with_rating_stars = Vendor.objects.filter(rating_stars__gt=0).count()
        vendors_with_rating_percentage = Vendor.objects.filter(rating_percentage__gt=0).count()
        
        self.stdout.write(f"  Total Ratings in Database: {total_ratings}")
        self.stdout.write(f"  ✓ Vendors with ratings: {vendors_with_ratings} ({self._percentage(vendors_with_ratings, total_vendors)}%)")
        self.stdout.write(f"  ✓ Vendors with review snippet: {vendors_with_review_snippet} ({self._percentage(vendors_with_review_snippet, total_vendors)}%)")
        self.stdout.write(f"  ✓ Vendors with rating stars: {vendors_with_rating_stars} ({self._percentage(vendors_with_rating_stars, total_vendors)}%)")
        self.stdout.write(f"  ✓ Vendors with rating percentage: {vendors_with_rating_percentage} ({self._percentage(vendors_with_rating_percentage, total_vendors)}%)")
        self.stdout.write(f"  ✗ Vendors without ratings: {vendors_without_ratings} ({self._percentage(vendors_without_ratings, total_vendors)}%)")
        self.stdout.write('')

        # Overall completeness
        self.stdout.write(self.style.WARNING('OVERALL COMPLETENESS:'))
        self.stdout.write('-' * 80)
        
        fully_complete_vendors = Vendor.objects.exclude(
            Q(logo='') | Q(logo='/images/logo-placeholder.png') | Q(logo__isnull=True)
        ).exclude(
            Q(description='') | Q(description__isnull=True)
        ).filter(rating_stars__gt=0).count()
        
        self.stdout.write(f"  ✓ Fully complete vendors (logo + description + ratings): {fully_complete_vendors} ({self._percentage(fully_complete_vendors, total_vendors)}%)")
        self.stdout.write('')

        # Generate report data
        report = {
            'audit_timestamp': datetime.now().isoformat(),
            'summary': {
                'total_vendors': total_vendors,
                'active_vendors': active_vendors,
                'fully_complete_vendors': fully_complete_vendors,
                'completeness_percentage': self._percentage(fully_complete_vendors, total_vendors)
            },
            'logos': {
                'with_real_logo': vendors_with_logo,
                'with_placeholder': vendors_with_placeholder,
                'without_logo': vendors_without_logo,
                'percentage_complete': self._percentage(vendors_with_logo, total_vendors)
            },
            'descriptions': {
                'with_description': vendors_with_description,
                'with_quality_description': vendors_with_good_description,
                'without_description': vendors_without_description,
                'percentage_complete': self._percentage(vendors_with_description, total_vendors)
            },
            'ratings': {
                'total_ratings': total_ratings,
                'vendors_with_ratings': vendors_with_ratings,
                'vendors_with_review_snippet': vendors_with_review_snippet,
                'vendors_with_rating_stars': vendors_with_rating_stars,
                'vendors_with_rating_percentage': vendors_with_rating_percentage,
                'vendors_without_ratings': vendors_without_ratings,
                'percentage_complete': self._percentage(vendors_with_ratings, total_vendors)
            }
        }

        # Verbose mode: show sample vendors needing enrichment
        if options['verbose']:
            self.stdout.write(self.style.WARNING('SAMPLE VENDORS NEEDING ENRICHMENT:'))
            self.stdout.write('-' * 80)
            
            # Sample vendors without logos
            self.stdout.write('\nVendors without logos (first 5):')
            for vendor in Vendor.objects.filter(Q(logo='') | Q(logo__isnull=True))[:5]:
                self.stdout.write(f"  - {vendor.name} (ID: {vendor.id}, State: {vendor.state})")
            
            # Sample vendors without descriptions
            self.stdout.write('\nVendors without descriptions (first 5):')
            for vendor in Vendor.objects.filter(Q(description='') | Q(description__isnull=True))[:5]:
                self.stdout.write(f"  - {vendor.name} (ID: {vendor.id}, State: {vendor.state})")
            
            # Sample vendors without ratings
            self.stdout.write('\nVendors without ratings (first 5):')
            for vendor in Vendor.objects.annotate(rating_count=Count('ratings')).filter(rating_count=0)[:5]:
                self.stdout.write(f"  - {vendor.name} (ID: {vendor.id}, State: {vendor.state})")
            
            self.stdout.write('')

        # Save to file if requested
        if options['output']:
            output_path = options['output']
            with open(output_path, 'w') as f:
                json.dump(report, f, indent=2)
            self.stdout.write(self.style.SUCCESS(f"✓ Report saved to: {output_path}"))
            self.stdout.write('')

        # Summary
        self.stdout.write(self.style.SUCCESS('=' * 80))
        self.stdout.write(self.style.SUCCESS('AUDIT COMPLETE'))
        self.stdout.write(self.style.SUCCESS('=' * 80))
        
        # Show recommendations
        self.stdout.write('')
        self.stdout.write(self.style.WARNING('RECOMMENDATIONS:'))
        if vendors_without_logo > 0:
            self.stdout.write(f"  → Run logo enrichment for {vendors_without_logo} vendors")
        if vendors_without_description > 0:
            self.stdout.write(f"  → Run description enrichment for {vendors_without_description} vendors")
        if vendors_without_ratings > 0:
            self.stdout.write(f"  → Run ratings migration for {vendors_without_ratings} vendors")
        
        if fully_complete_vendors == total_vendors:
            self.stdout.write(self.style.SUCCESS('  ✓ All vendors are fully enriched!'))

    def _percentage(self, part, total):
        """Calculate percentage with 1 decimal place"""
        if total == 0:
            return 0.0
        return round((part / total) * 100, 1)
