import csv
import logging
from django.core.management.base import BaseCommand
from django.db import transaction
from apps.common.models import CustomRedirect

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Import redirects from a CSV file (e.g. redirect_map.csv)'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str, help='The path to the CSV file to be imported')

    def handle(self, *args, **kwargs):
        csv_file_path = kwargs['csv_file']
        
        try:
            with open(csv_file_path, mode='r', encoding='utf-8-sig') as f:
                reader = csv.DictReader(f)
                
                redirects_to_create = []
                count = 0
                seen_paths = set()
                
                for row in reader:
                    old_path = row.get('Old Path', '').strip()
                    new_path = row.get('New Path', '').strip()
                    status_code = row.get('HTTP Status', '301').strip()
                    
                    if not old_path or not new_path:
                        self.stdout.write(self.style.WARNING(f"Skipping row with missing data: {row}"))
                        continue
                        
                    # Basic cleanup - ensure paths start with /
                    if not old_path.startswith('/'):
                        old_path = '/' + old_path
                        
                    if old_path in seen_paths:
                        continue
                    seen_paths.add(old_path)

                        
                    # Basic cleanup - ensure paths start with /
                    if not old_path.startswith('/'):
                        old_path = '/' + old_path
                        
                    if not new_path.startswith('http') and not new_path.startswith('/'):
                        new_path = '/' + new_path
                        
                    try:
                        status_code = int(status_code)
                    except ValueError:
                        status_code = 301
                        
                    redirects_to_create.append(
                        CustomRedirect(
                            old_path=old_path,
                            new_path=new_path,
                            status_code=status_code
                        )
                    )
                    count += 1
                    
                # Bulk insert or update
                with transaction.atomic():
                    # Since some URLs might already exist, bulk_create can fail if unique=True is violated.
                    # We will delete existing ones first to ensure clean state, or use ignore_conflicts.
                    # Given it's a seed, we will clear existing redirects or ignore conflicts.
                    CustomRedirect.objects.all().delete()
                    CustomRedirect.objects.bulk_create(redirects_to_create, batch_size=1000)
                    
                self.stdout.write(self.style.SUCCESS(f"Successfully imported {count} custom redirects into the database."))
                
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f"CSV file not found at path: {csv_file_path}"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error during import: {str(e)}"))
