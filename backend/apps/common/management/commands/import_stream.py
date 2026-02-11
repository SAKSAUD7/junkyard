import os
import sys
import gzip
import ijson
from django.core.management.base import BaseCommand
from django.core.serializers import deserialize
from django.db import transaction, connection
import json

class Command(BaseCommand):
    help = 'Import data using STREAMING to use almost 0 RAM.'

    def handle(self, *args, **options):
        # Locate files
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) 
        root_dir = os.path.join(base_dir, '..', '..', '..') 
        
        gz_file = os.path.join(root_dir, 'full_database_dump.json.gz')
        json_file = os.path.join(root_dir, 'full_database_dump.json')
        
        target_file = None
        if os.path.exists(gz_file):
            target_file = gz_file
        elif os.path.exists(json_file):
            target_file = json_file
            
        if not target_file:
            # Azure fallback
            base_azure = '/home/site/wwwroot'
            gz_azure = os.path.join(base_azure, 'full_database_dump.json.gz')
            if os.path.exists(gz_azure):
                target_file = gz_azure
        
        if not target_file:
             # Try common tmp locations if user moved it manually
             # but usually it's in the app root if deployed
             pass

        if not target_file:
            self.stdout.write(self.style.ERROR('❌ No dump file found!'))
            return

        self.stdout.write(self.style.SUCCESS(f'📦 Found dump: {target_file}'))
        self.stdout.write('🚀 Starting STREAMING import (Low Memory Mode)...')
        
        # Open file stream
        if target_file.endswith('.gz'):
            f = gzip.open(target_file, 'rb')
        else:
            f = open(target_file, 'rb')

        # Use ijson to iterate over items one by one
        # 'item' argument assumes the valid JSON is a list of objects [...]
        objects = ijson.items(f, 'item')
        
        batch = []
        count = 0
        success_count = 0
        batch_size = 1000

        for obj_data in objects:
            # obj_data is a dictionary. We need to convert it back to a format
            # compatible with deserialize. deserialize expects a list of dicts,
            # or we can wrap single dict in list.
            
            # Since we are essentially manually deserializing, we can just pass
            # the raw data if we simulate the structure or just use deserialize 
            # on a small list of 1 item.
            
            # Optimization: Accumulate strict JSON dicts then deserialize batch
            batch.append(obj_data)
            count += 1
            
            if len(batch) >= batch_size:
                self.process_batch(batch, success_count)
                success_count += len(batch)
                batch = []
                self.stdout.write(f'⏳ Saved: {success_count}')

        # Remaining
        if batch:
            self.process_batch(batch, success_count)
            success_count += len(batch)
            
        f.close()
        self.stdout.write(self.style.SUCCESS(f'🎉 DONE! Imported {success_count} records.'))

    def process_batch(self, batch_data, start_index):
        # Convert list of dicts to JSON string for Django deserializer
        # This is slightly inefficient but safe.
        json_str = json.dumps(batch_data)
        
        ds_objects = deserialize('json', json_str)
        
        try:
            with transaction.atomic():
                for obj in ds_objects:
                    obj.save()
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'⚠️ Batch failed at {start_index}: {str(e)}'))
