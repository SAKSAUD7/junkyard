import os
import sys
from django.core.management.base import BaseCommand
from django.core.management import call_command


class Command(BaseCommand):
    help = 'Import complete database from full_database_dump.json'

    def handle(self, *args, **options):
        # Check for compressed file first
        dump_file_gz = os.path.join(os.path.dirname(__file__), '..', '..', '..', '..', 'full_database_dump.json.gz')
        dump_file_json = os.path.join(os.path.dirname(__file__), '..', '..', '..', '..', 'full_database_dump.json')
        
        target_file = None
        is_compressed = False

        if os.path.exists(dump_file_gz):
            target_file = dump_file_gz
            is_compressed = True
            self.stdout.write(self.style.SUCCESS(f'📦 Found COMPRESSED dump: {target_file}'))
        elif os.path.exists(dump_file_json):
            target_file = dump_file_json
            self.stdout.write(self.style.SUCCESS(f'📦 Found JSON dump: {target_file}'))
        else:
            self.stdout.write(self.style.ERROR(f'❌ No dump file found!'))
            self.stdout.write(self.style.WARNING('Expected: full_database_dump.json.gz OR full_database_dump.json'))
            return

        self.stdout.write(self.style.WARNING('⚠️  This will import ALL data. Existing data will be updated.'))
        self.stdout.write('🚀 Starting import...')
        
        try:
            # If compressed, let Django handle it if it supports it, 
            # OR decompress to a temp file if needed. 
            # Django's loaddata supports serialization formats, but not directly .gz usually unless extensions are installed.
            # Safer to decompress to temp file.
            
            final_file = target_file
            
            if is_compressed:
                self.stdout.write('Decompressing file...')
                import gzip
                import shutil
                import tempfile
                
                # Create temp file
                temp_fd, temp_path = tempfile.mkstemp(suffix='.json')
                os.close(temp_fd)
                
                with gzip.open(target_file, 'rb') as f_in:
                    with open(temp_path, 'wb') as f_out:
                        shutil.copyfileobj(f_in, f_out)
                
                final_file = temp_path
                self.stdout.write(f'Decompressed to {final_file}')

            # Load data
            call_command('loaddata', final_file)
            
            if is_compressed:
                os.remove(final_file)
            
            self.stdout.write(self.style.SUCCESS('✅ Database import complete!'))
            self.stdout.write(self.style.SUCCESS('All vendors, users, leads, and data have been imported.'))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Import failed: {str(e)}'))
            sys.exit(1)
