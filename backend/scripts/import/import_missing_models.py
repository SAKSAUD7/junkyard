"""
Check and Import Missing Models
================================
"""
import os
import sys
import django
import json
from pathlib import Path

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from apps.hollander.models import Model, Make
from django.db import transaction

JSON_DIR = Path(r"c:\Users\saksa\Videos\jynm_json\jynm_json")

print("\n=== CHECKING MODEL DATA ===\n")

# Current count
current_count = Model.objects.count()
print(f"Current Models in DB: {current_count}")

# Check all model files
model_files = [
    "_model.json",
    "qmodels.json", 
    "models_by_make.json"
]

all_models = set()
for file in model_files:
    file_path = JSON_DIR / file
    if file_path.exists():
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            count = len(data) if isinstance(data, list) else len(data.keys()) if isinstance(data, dict) else 0
            print(f"{file}: {count} records")
            
            # Collect unique models
            if isinstance(data, list):
                for item in data:
                    model_name = item.get('ModelName') or item.get('model_name') or item.get('name')
                    make_id = item.get('MakeID') or item.get('make_id')
                    if model_name:
                        all_models.add((make_id, model_name))

print(f"\nTotal unique models across files: {len(all_models)}")

# Import missing models
print("\n=== IMPORTING MISSING MODELS ===\n")

created = 0
skipped = 0

with transaction.atomic():
    for make_id, model_name in all_models:
        if not make_id or not model_name:
            continue
            
        # Find make
        make = Make.objects.filter(make_id=make_id).first()
        if not make:
            skipped += 1
            continue
        
        # Check if exists
        existing = Model.objects.filter(make=make, model_name=model_name).first()
        if existing:
            skipped += 1
            continue
        
        # Create new model
        Model.objects.create(
            make=make,
            model_name=model_name,
            model_id=Model.objects.count() + 1000  # Generate new ID
        )
        created += 1
        
        if created % 100 == 0:
            print(f"Progress: {created} models created...")

print(f"\n✅ Import Complete:")
print(f"   Created: {created}")
print(f"   Skipped: {skipped}")
print(f"   Total in DB: {Model.objects.count()}")
