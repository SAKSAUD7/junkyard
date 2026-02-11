import os
import sys
import django
from django.db import connection

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.apps import apps

INVENTORY_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'database_inventory.txt')

def verify_counts():
    print("🔍 verifying Azure Database Row Counts...")
    print("=" * 60)
    print(f"{'App.Model':<40} | {'Expected':>10} | {'Actual':>10} | {'Status':<10}")
    print("-" * 60)
    
    mismatches = []
    
    with open(INVENTORY_FILE, 'r', encoding='utf-8', errors='ignore') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('=') or line.startswith('TOTAL'):
                continue
                
            parts = line.split()
            if len(parts) < 2:
                continue
                
            model_key = parts[0]
            try:
                expected_str = parts[1].replace(',', '')
                expected = int(expected_str)
            except ValueError:
                continue

            # Try to get model class
            try:
                app_label, model_name = model_key.split('.')
                model = apps.get_model(app_label, model_name)
                actual = model.objects.count()
            except LookupError:
                print(f"{model_key:<40} | {expected:>10,} | {'MISSING':>10} | ❌ Model Not Found")
                mismatches.append(f"{model_key}: Model not found")
                continue
            except Exception as e:
                print(f"{model_key:<40} | {expected:>10,} | {'ERROR':>10} | ❌ {str(e)}")
                mismatches.append(f"{model_key}: Error {str(e)}")
                continue

            status = "✅ OK" if actual == expected else "❌ MISMATCH"
            print(f"{model_key:<40} | {expected:>10,} | {actual:>10,} | {status}")
            
            if actual != expected:
                mismatches.append(f"{model_key}: Expected {expected}, Got {actual}")

    print("=" * 60)
    if mismatches:
        print(f"⚠️ Found {len(mismatches)} mismatches!")
        for m in mismatches:
            print(f"  - {m}")
    else:
        print("🎉 ALL MODELS MATCH PERFECTLY!")

if __name__ == '__main__':
    verify_counts()
