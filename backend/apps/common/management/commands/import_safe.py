import os
import sys
import json
import gzip
import gc
from django.core.management.base import BaseCommand
from django.core.serializers import deserialize
from django.db import transaction, connection

class Command(BaseCommand):
    help = 'Import data in safe batches to prevent DB crashes'

    def handle(self, *args, **options):
        # Locate files
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) # apps/common
        root_dir = os.path.join(base_dir, '..', '..', '..') # junkyard root
        
        gz_file = os.path.join(root_dir, 'full_database_dump.json.gz')
        json_file = os.path.join(root_dir, 'full_database_dump.json')
        
        target_file = None
        if os.path.exists(gz_file):
            target_file = gz_file
        elif os.path.exists(json_file):
            target_file = json_file
            
        if not target_file:
            # Fallback for Azure paths
            base_azure = '/home/site/wwwroot'
            gz_azure = os.path.join(base_azure, 'full_database_dump.json.gz')
            if os.path.exists(gz_azure):
                target_file = gz_azure
        
        if not target_file:
             # Try /tmp lookup if needed, but usually it's in root
             pass

        if not target_file:
            self.stdout.write(self.style.ERROR('❌ No dump file found!'))
            return

        self.stdout.write(self.style.SUCCESS(f'📦 Found dump: {target_file}'))
        
        # 1. Load Data (Memory Step)
        data = None
        self.stdout.write('📂 Loading JSON into memory...')
        try:
            if target_file.endswith('.gz'):
                with gzip.open(target_file, 'rb') as f:
                    data = json.load(f)
            else:
                with open(target_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Failed to load JSON: {str(e)}'))
            return

        total = len(data)
        self.stdout.write(self.style.SUCCESS(f'✅ Loaded {total} objects! Processing...'))
        
        # 2. Deserialization & Batch Save
        batch_size = 1000
        objects = deserialize('json', json.dumps(data))
        
        batch = []
        count = 0
        success_count = 0
        
        # Turn off auto-commit for performance, but we handle transactions manually
        # Actually in Django default is auto-commit.
        
        for obj in objects:
            batch.append(obj)
            count += 1
            
            if len(batch) >= batch_size:
                self.save_batch(batch, success_count)
                success_count += len(batch)
                batch = []
                gc.collect() # Free memory
                self.stdout.write(f'⏳ Progress: {success_count}/{total}')

        # Save remaining
        if batch:
            self.save_batch(batch, success_count)
            success_count += len(batch)
        
        self.stdout.write(self.style.SUCCESS('🎉 IMPORT COMPLETE!'))

    def save_batch(self, batch, start_index):
        try:
            with transaction.atomic():
                for obj in batch:
                    obj.save()
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'⚠️ Batch failed at {start_index}: {str(e)}'))
            # Optional: Retry individually if needed, but for now just fail batch
