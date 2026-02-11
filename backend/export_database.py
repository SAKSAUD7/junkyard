import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.core.management import call_command

# Set UTF-8 encoding for output
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

print("🚀 Starting complete database export with UTF-8 encoding...")
print("This may take several minutes for 6000+ vendors...")

# Export to file with UTF-8 encoding
output_file = 'full_database_dump.json'

with open(output_file, 'w', encoding='utf-8') as f:
    call_command(
        'dumpdata',
        '--natural-foreign',
        '--natural-primary',
        '--exclude', 'auth.permission',
        '--exclude', 'contenttypes',
        '--exclude', 'sessions.session',
        '--exclude', 'admin.logentry',
        stdout=f
    )

# Check file size
file_size = os.path.getsize(output_file)
file_size_mb = file_size / (1024 * 1024)

print(f"\n✅ Export complete!")
print(f"📦 File: {output_file}")
print(f"📊 Size: {file_size_mb:.2f}MB")
print("\nNext: This file will be uploaded to Azure")
