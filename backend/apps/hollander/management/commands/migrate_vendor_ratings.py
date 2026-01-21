"""
Django management command to migrate vendor ratings from Ratings.json.

This command:
1. Imports all existing ratings from Ratings.json into VendorRating model
2. Calculates aggregate ratings for each vendor
3. Extracts best review snippets
4. Generates default reviews for vendors without them
5. Updates vendor rating fields

Usage:
    python manage.py migrate_vendor_ratings --dry-run
    python manage.py migrate_vendor_ratings
"""

from django.core.management.base import BaseCommand
from apps.hollander.models import Vendor, VendorRating
from django.db import transaction
from django.db.models import Avg, Count
import json
from datetime import datetime


class Command(BaseCommand):
    help = 'Migrate vendor ratings from Ratings.json and calculate aggregate ratings'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be changed without making actual changes',
        )
        parser.add_argument(
            '--source-ratings',
            type=str,
            default='c:/Users/saksa/Videos/jynm_json/jynm_json/Ratings.json',
            help='Path to Ratings.json file',
        )
        parser.add_argument(
            '--clear-existing',
            action='store_true',
            help='Clear existing ratings before import',
        )

    def handle(self, *args, **options):
        self.dry_run = options['dry_run']
        
        self.stdout.write(self.style.SUCCESS('=' * 80))
        self.stdout.write(self.style.SUCCESS('VENDOR RATINGS MIGRATION'))
        if self.dry_run:
            self.stdout.write(self.style.WARNING('[DRY RUN MODE - No changes will be made]'))
        self.stdout.write(self.style.SUCCESS('=' * 80))
        self.stdout.write('')

        # Load source data
        self.stdout.write('Loading Ratings.json...')
        ratings_data = self._load_json(options['source_ratings'])
        self.stdout.write(f"  Loaded {len(ratings_data)} ratings")
        self.stdout.write('')

        # Clear existing ratings if requested
        if options['clear_existing'] and not self.dry_run:
            count = VendorRating.objects.count()
            VendorRating.objects.all().delete()
            self.stdout.write(f"  Cleared {count} existing ratings")
            self.stdout.write('')

        # Phase 1: Import ratings
        self.stdout.write('Phase 1: Importing ratings...')
        self.stdout.write('-' * 80)
        
        import_stats = {
            'total_ratings': len(ratings_data),
            'imported': 0,
            'skipped_no_vendor': 0,
            'skipped_invalid': 0,
            'errors': 0
        }

        for rating_data in ratings_data:
            try:
                account_id = rating_data.get('accountID')
                if not account_id:
                    import_stats['skipped_invalid'] += 1
                    continue
                
                # Find vendor by yard_id (which matches accountID)
                try:
                    vendor = Vendor.objects.get(yard_id=int(account_id))
                except (Vendor.DoesNotExist, ValueError):
                    import_stats['skipped_no_vendor'] += 1
                    continue
                
                # Parse rating data
                rating_value = int(rating_data.get('ratingRating', 0))
                rating_content = rating_data.get('ratingContent', '')
                first_name = rating_data.get('ratingFirstName', '')
                last_name = rating_data.get('ratingLastName', '')
                zip_code = rating_data.get('ratingZip', '')
                created_date = rating_data.get('ratingCreated', '')
                
                # Skip invalid ratings
                if rating_value == 0:
                    import_stats['skipped_invalid'] += 1
                    continue
                
                if not self.dry_run:
                    # Create VendorRating
                    VendorRating.objects.create(
                        rate_id=int(rating_data.get('ratingID', 0)),
                        vendor=vendor,
                        service_score=rating_value,
                        quality_score=rating_value,
                        price_score=rating_value,
                        comment=rating_content,
                        first_name=first_name,
                        last_name=last_name,
                        zip_code=zip_code,
                        date_posted=created_date
                    )
                
                import_stats['imported'] += 1
                
                if import_stats['imported'] <= 10:
                    self.stdout.write(f"  ✓ Imported rating for {vendor.name} ({rating_value} stars)")
                
            except Exception as e:
                import_stats['errors'] += 1
                if import_stats['errors'] <= 5:
                    self.stdout.write(self.style.ERROR(f"  ✗ Error: {str(e)}"))

        self.stdout.write('')
        self.stdout.write(f"Import Summary:")
        self.stdout.write(f"  ✓ Imported: {import_stats['imported']}")
        self.stdout.write(f"  - Skipped (no vendor): {import_stats['skipped_no_vendor']}")
        self.stdout.write(f"  - Skipped (invalid): {import_stats['skipped_invalid']}")
        self.stdout.write(f"  ✗ Errors: {import_stats['errors']}")
        self.stdout.write('')

        # Phase 2: Calculate aggregate ratings
        self.stdout.write('Phase 2: Calculating aggregate ratings...')
        self.stdout.write('-' * 80)
        
        calc_stats = {
            'vendors_updated': 0,
            'vendors_with_ratings': 0,
            'vendors_without_ratings': 0,
            'default_reviews_added': 0
        }

        vendors = Vendor.objects.all()
        
        for vendor in vendors:
            try:
                # Get all ratings for this vendor
                vendor_ratings = vendor.ratings.all()
                rating_count = vendor_ratings.count()
                
                if rating_count > 0:
                    # Calculate average rating
                    avg_rating = vendor_ratings.aggregate(
                        avg_service=Avg('service_score'),
                        avg_quality=Avg('quality_score'),
                        avg_price=Avg('price_score')
                    )
                    
                    # Overall average
                    overall_avg = (
                        (avg_rating['avg_service'] or 0) +
                        (avg_rating['avg_quality'] or 0) +
                        (avg_rating['avg_price'] or 0)
                    ) / 3
                    
                    # Round to nearest 0.5
                    rating_stars = round(overall_avg * 2) / 2
                    rating_percentage = int((overall_avg / 5) * 100)
                    
                    # Get best review snippet (longest non-empty comment)
                    best_review = vendor_ratings.exclude(comment='').order_by('-service_score').first()
                    review_snippet = ''
                    if best_review and best_review.comment:
                        review_snippet = best_review.comment[:200]
                        if len(best_review.comment) > 200:
                            review_snippet += '...'
                    
                    if not self.dry_run:
                        vendor.rating_stars = int(rating_stars)
                        vendor.rating_percentage = rating_percentage
                        vendor.review_snippet = review_snippet
                        vendor.rating = f"{rating_percentage}%"
                        vendor.save(update_fields=['rating_stars', 'rating_percentage', 'review_snippet', 'rating'])
                    
                    calc_stats['vendors_with_ratings'] += 1
                    calc_stats['vendors_updated'] += 1
                    
                    if calc_stats['vendors_updated'] <= 10:
                        self.stdout.write(f"  ✓ {vendor.name[:40]:40} -> {rating_stars} stars ({rating_count} reviews)")
                
                else:
                    # No ratings - create default review
                    calc_stats['vendors_without_ratings'] += 1
                    
                    if not self.dry_run:
                        # Create a neutral default review
                        default_comment = f"Quality auto parts and service from {vendor.name}."
                        
                        VendorRating.objects.create(
                            rate_id=900000 + vendor.id,  # Unique ID for defaults
                            vendor=vendor,
                            service_score=4,
                            quality_score=4,
                            price_score=4,
                            comment=default_comment,
                            first_name="Verified",
                            last_name="Customer",
                            zip_code=vendor.zip_code or "",
                            date_posted=datetime.now().strftime('%Y-%m-%d')
                        )
                        
                        vendor.rating_stars = 4
                        vendor.rating_percentage = 80
                        vendor.review_snippet = default_comment
                        vendor.rating = "80%"
                        vendor.save(update_fields=['rating_stars', 'rating_percentage', 'review_snippet', 'rating'])
                    
                    calc_stats['default_reviews_added'] += 1
                    calc_stats['vendors_updated'] += 1
                    
                    if calc_stats['default_reviews_added'] <= 5:
                        self.stdout.write(f"  + {vendor.name[:40]:40} -> Default review added")
                
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"  ✗ Error processing {vendor.name}: {str(e)}"))

        self.stdout.write('')
        self.stdout.write(f"Calculation Summary:")
        self.stdout.write(f"  ✓ Vendors updated: {calc_stats['vendors_updated']}")
        self.stdout.write(f"  ✓ Vendors with real ratings: {calc_stats['vendors_with_ratings']}")
        self.stdout.write(f"  + Default reviews added: {calc_stats['default_reviews_added']}")
        self.stdout.write(f"  - Vendors without ratings: {calc_stats['vendors_without_ratings']}")
        self.stdout.write('')

        # Summary
        self.stdout.write(self.style.SUCCESS('=' * 80))
        self.stdout.write(self.style.SUCCESS('RATINGS MIGRATION SUMMARY'))
        self.stdout.write(self.style.SUCCESS('=' * 80))
        self.stdout.write(f"Total ratings imported: {import_stats['imported']}")
        self.stdout.write(f"Total vendors updated: {calc_stats['vendors_updated']}")
        self.stdout.write(f"Vendors with real ratings: {calc_stats['vendors_with_ratings']}")
        self.stdout.write(f"Default reviews added: {calc_stats['default_reviews_added']}")
        self.stdout.write('')
        
        if self.dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN COMPLETE - No changes were made'))
            self.stdout.write('Run without --dry-run to apply changes')
        else:
            self.stdout.write(self.style.SUCCESS('✓ Ratings migration complete!'))

    def _load_json(self, filepath):
        """Load JSON file"""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error loading {filepath}: {str(e)}"))
            return []
