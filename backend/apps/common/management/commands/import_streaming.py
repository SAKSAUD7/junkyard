import os
import gzip
import ijson
from django.core.management.base import BaseCommand
from django.apps import apps
from django.db import transaction

class Command(BaseCommand):
    help = 'Import data using streaming (low memory usage)'

    def handle(self, *args, **options):
        # Find the dump file
        dump_file = None
        possible_paths = [
            '/tmp/8de652b2655a6b2/full_database_dump.json.gz',
            '/home/site/wwwroot/full_database_dump.json.gz',
            'full_database_dump.json.gz'
        ]
        
        for path in possible_paths:
            if os.path.exists(path):
                dump_file = path
                break
        
        if not dump_file:
            self.stdout.write(self.style.ERROR('❌ Dump file not found!'))
            return
        
        self.stdout.write(self.style.SUCCESS(f'📦 Found: {dump_file}'))
        self.stdout.write('🔄 Starting streaming import...')
        
        # Open and stream the file
        with gzip.open(dump_file, 'rb') as gz_file:
            # Parse JSON incrementally
            objects = ijson.items(gz_file, 'item')
            
            batch = []
            count = 0
            batch_size = 500  # Smaller batches for safety
            
            for obj in objects:
                try:
                    # Get the model
                    model_name = obj.get('model')
                    if not model_name:
                        continue
                    
                    app_label, model_class_name = model_name.split('.')
                    Model = apps.get_model(app_label, model_class_name)
                    
                    # Get the fields
                    pk = obj.get('pk')
                    fields = obj.get('fields', {})
                    
                    # Create instance
                    instance = Model(pk=pk, **fields)
                    batch.append(instance)
                    count += 1
                    
                    # Save in batches
                    if len(batch) >= batch_size:
                        self._save_batch(batch)
                        self.stdout.write(f'✅ Imported {count} records...')
                        batch = []
                
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f'⚠️ Skipped record: {str(e)}'))
                    continue
            
            # Save remaining
            if batch:
                self._save_batch(batch)
            
            self.stdout.write(self.style.SUCCESS(f'🎉 Import complete! Total: {count} records'))
    
    def _save_batch(self, batch):
        """Save a batch of objects"""
        try:
            with transaction.atomic():
                for obj in batch:
                    obj.save()
        except Exception as e:
            # Try saving individually if batch fails
            self.stdout.write(self.style.WARNING(f'⚠️ Batch save failed, trying individually...'))
            for obj in batch:
                try:
                    obj.save()
                except Exception as e2:
                    self.stdout.write(self.style.ERROR(f'❌ Failed to save {obj}: {str(e2)}'))
