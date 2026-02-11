import os
import sys
import django

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set Azure Env Vars
os.environ['DB_ENGINE'] = 'django.db.backends.postgresql'
os.environ['DB_NAME'] = 'junkyard'
os.environ['DB_USER'] = 'junkyard_admin'
os.environ['DB_PASSWORD'] = 'saksaud@7411'
os.environ['DB_HOST'] = 'junk.postgres.database.azure.com'
os.environ['DB_PORT'] = '5432'
os.environ['DB_SSLMODE'] = 'require'

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.core.management import call_command

print("🚀 Loading data into Azure Database...")
print("This operation will take a significant amount of time due to 4.8M records.")
try:
    call_command('import_full_database')
    print("✅ Data loading complete!")
except Exception as e:
    print(f"❌ Data loading failed: {e}")
