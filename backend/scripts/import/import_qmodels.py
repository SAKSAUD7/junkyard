"""
Import Models from qmodels.json
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

print("\n=== IMPORTING MODELS FROM qmodels.json ===\n")

qmodels_file = JSON_DIR / "qmodels.json"

with open(qmodels_file, 'r', encoding='utf-8') as f:
    qmodels_data = json.load(f)

print(f"Found {len(qmodels_data)} models in qmodels.json")
print(f"Current models in DB: {Model.objects.count()}")

created = 0
updated = 0
skipped = 0
errors = 0

# Get max model_id to generate new IDs
max_id = Model.objects.order_by('-model_id').first()
next_id = max_id.model_id + 1 if max_id else 1000

with transaction.atomic():
    for item in qmodels_data:
        try:
            # Extract fields (try multiple field name variations)
            model_id = item.get('ModelID') or item.get('model_id') or item.get('id')
            model_name = item.get('ModelName') or item.get('model_name') or item.get('name')
            make_id = item.get('MakeID') or item.get('make_id')
            
            if not model_name or not make_id:
                skipped += 1
                continue
            
            # Find make
            make = Make.objects.filter(make_id=make_id).first()
            if not make:
                # Try by name
                make_name = item.get('MakeName') or item.get('make_name')
                if make_name:
                    make = Make.objects.filter(make_name__iexact=make_name).first()
                
                if not make:
                    skipped += 1
                    continue
            
            # Check if model exists
            existing = Model.objects.filter(make=make, model_name__iexact=model_name).first()
            
            if existing:
                skipped += 1
                continue
            
            # Use provided model_id or generate new one
            if not model_id:
                model_id = next_id
                next_id += 1
            
            # Create new model
            Model.objects.create(
                model_id=model_id,
                make=make,
                model_name=model_name
            )
            created += 1
            
            if created % 500 == 0:
                print(f"Progress: {created} models created...")
        
        except Exception as e:
            errors += 1
            if errors < 10:
                print(f"Error: {e}")

print(f"\n✅ Import Complete:")
print(f"   Created: {created}")
print(f"   Skipped: {skipped}")
print(f"   Errors: {errors}")
print(f"   Total in DB: {Model.objects.count()}")
