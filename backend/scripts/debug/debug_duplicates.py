
import os
import django
from django.db.models import Count

# Setup Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from apps.hollander.models import Make, Model

def debug_dupes():
    print("--- CHECKING FOR DUPLICATES ---")
    
    # Check Makes
    dupe_makes = Make.objects.values('make_name').annotate(count=Count('make_id')).filter(count__gt=1)
    if dupe_makes.exists():
        print(f"DUPLICATE MAKES FOUND: {len(dupe_makes)}")
        for m in dupe_makes:
            print(f" - {m['make_name']} ({m['count']} entries)")
            objs = Make.objects.filter(make_name=m['make_name'])
            for o in objs:
                print(f"   -> ID: {o.make_id}")
    else:
        print("No duplicate Makes found.")
        
    # Check Models specific to Suzuki
    # Find Suzuki Make(s)
    suzukis = Make.objects.filter(make_name__iexact='Suzuki')
    for s in suzukis:
        print(f"\nChecking Models for Suzuki (ID: {s.make_id})")
        dupe_models = Model.objects.filter(make=s).values('model_name').annotate(count=Count('model_id')).filter(count__gt=1)
        if dupe_models.exists():
            print(f"  DUPLICATE MODELS FOUND: {len(dupe_models)}")
            for m in dupe_models:
                print(f"   - {m['model_name']} ({m['count']})")
        else:
            print("  No duplicate Models found for this Suzuki ID.")
            
        # Check if 'Verona' exists
        verona = Model.objects.filter(make=s, model_name__iexact='Verona')
        print(f"  'Verona' Count: {verona.count()}")
        for v in verona:
             print(f"   -> ID: {v.model_id} (Name: {v.model_name})")

if __name__ == "__main__":
    debug_dupes()
