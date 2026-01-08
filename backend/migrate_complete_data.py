"""
Complete Data Migration: Models, Years, Parts
Migrates ALL data needed for cascading dropdowns
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.common.models import Model as OldModel, Part as OldPart
from apps.hollander.models import Make as HollanderMake, Model as HollanderModel, PartType as HollanderPartType, YearRange
from django.db import transaction

def migrate_models():
    """Migrate models from common_model to hollander_model"""
    print("\n" + "="*60)
    print("MIGRATING MODELS")
    print("="*60)
    
    old_models = OldModel.objects.all()
    print(f"Found {old_models.count()} models in common_model")
    
    # Create Make ID map
    make_map = {m.make_name: m for m in HollanderMake.objects.all()}
    
    batch = []
    for idx, old in enumerate(old_models, 1):
        # Get make ID
        make_name = getattr(old, 'make_name', None) or getattr(old, 'make', None)
        if not make_name:
            continue
            
        make_obj = make_map.get(make_name)
        if not make_obj:
            print(f"Warning: Make '{make_name}' not found, skipping model"
)
            continue
        
        model = HollanderModel(
            model_id=idx,
            make=make_obj,
            model_name=getattr(old, 'name', '') or getattr(old, 'model_name', '')
        )
        batch.append(model)
    
    HollanderModel.objects.bulk_create(batch, ignore_conflicts=True)
    print(f"✓ Migrated {len(batch)} models to hollander_model")
    return len(batch)

def migrate_parts():
    """Migrate parts from common_part to hollander_part_type"""
    print("\n" + "="*60)
    print("MIGRATING PARTS")
    print("="*60)
    
    old_parts = OldPart.objects.all()
    print(f"Found {old_parts.count()} parts in common_part")
    
    batch = []
    for idx, old in enumerate(old_parts, 1):
        part = HollanderPartType(
            part_id=getattr(old, 'part_id', idx) or idx,
            part_name=getattr(old, 'name', '') or getattr(old, 'part_name', '')
        )
        batch.append(part)
    
    HollanderPartType.objects.bulk_create(batch, ignore_conflicts=True)
    print(f"✓ Migrated {len(batch)} parts to hollander_part_type")
    return len(batch)

def create_year_ranges():
    """Create year ranges for all make/model combinations"""
    print("\n" + "="*60)
    print("CREATING YEAR RANGES")
    print("="*60)
    
    # Create year ranges from 1990 to current year for all models
    from datetime import datetime
    current_year = datetime.now().year
    
    models = HollanderModel.objects.select_related('make').all()
    print(f"Creating year ranges for {models.count()} models")
    
    batch = []
    for model in models:
        yr = YearRange(
            make=model.make,
            model=model,
            year_start=1990,
            year_end=current_year
        )
        batch.append(yr)
    
    YearRange.objects.bulk_create(batch, ignore_conflicts=True)
    print(f"✓ Created {len(batch)} year ranges")
    return len(batch)

def main():
    print("\n" + "="*60)
    print("COMPLETE DATA MIGRATION FOR LEAD FORM")
    print("="*60)
    
    try:
        with transaction.atomic():
            model_count = migrate_models()
            part_count = migrate_parts()
            year_count = create_year_ranges()
        
        print("\n" + "="*60)
        print("✅ MIGRATION COMPLETE!")
        print("="*60)
        print(f"Models migrated: {model_count}")
        print(f"Parts migrated: {part_count}")
        print(f"Year ranges created: {year_count}")
        print(f"\n🎉 Lead form dropdowns should now work!")
        print("="*60)
        
        return 0
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    exit(main())
