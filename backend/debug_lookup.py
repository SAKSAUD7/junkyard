import os
import django
import sys

# Setup Django environment
sys.path.append(r"c:\Users\saksa\OneDrive\Desktop\junkyard\junkyard\backend")
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.hollander.models import HollanderInterchange, Make, Model, PartType

def debug_audi():
    print("\n--- DEBUGGING AUDI A8 2019 ---")
    
    # 1. Check if Make exists
    makes = Make.objects.filter(make_name__icontains="Audi")
    print(f"Makes found: {[m.make_name for m in makes]}")
    
    # 2. Check if Model exists
    models = Model.objects.filter(make__make_name="Audi", model_name__icontains="A8")
    print(f"Models found: {[m.model_name for m in models]}")
    
    # 3. Check Part Type
    parts = PartType.objects.filter(part_name__icontains="Air Injection")
    print(f"Part Types found: {[p.part_name for p in parts]}")
    
    # 4. Check Interchange Records (Raw)
    print("\nChecking Interchange Records (Broad Search)...")
    records = HollanderInterchange.objects.filter(
        make__iexact="Audi",
        model__icontains="A8"
    )[:5]
    if records:
        print(f"Found {len(records)} records for Audi A8. Sample:")
        for r in records:
            print(f" - {r.year_start}-{r.year_end} | {r.part_type} | {r.hollander_number}")
    else:
        print("No records found for Audi A8")
        
    # 5. Check Specific Query Failure
    print("\nChecking Specific Query (2019 Air Injection Pump)...")
    exact = HollanderInterchange.objects.filter(
        year_start__lte=2019,
        year_end__gte=2019,
        make__iexact="Audi",
        model__icontains="A8",
        part_type__icontains="Air Injection"
    )
    print(f"Exact match count: {exact.count()}")

if __name__ == "__main__":
    debug_audi()
