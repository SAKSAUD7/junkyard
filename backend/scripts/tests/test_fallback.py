
import os
import django

# Setup Django first
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from apps.hollander.models import HollanderPartRef

def test_engine_match():
    print("--- Testing 'Engine' Lookup ---")
    part_str = "Engine"
    
    # Simulate View Logic
    ref = HollanderPartRef.objects.filter(part_name__iexact=part_str).first()
    if not ref:
        print("Ref Exact: None")
        # Try contains
        # Sort by length to prefer "Engine Assembly" over "Engine Control Module"?
        # Default order is PK or name.
        refs = HollanderPartRef.objects.filter(part_name__icontains=part_str)
        print(f"Candidates found: {refs.count()}")
        for r in refs[:5]:
            print(f" - {r.part_name}")
            
        # Current Logic in View:
        chosen = HollanderPartRef.objects.filter(part_name__icontains=part_str).first()
        print(f"CHOSEN (Default): {chosen.part_name if chosen else 'None'}")
        
        # Proposed Logic: Sort by length
        # Django doesn't have Length lookup easily without Func, but we can do python sort for first match
        candidates = list(HollanderPartRef.objects.filter(part_name__icontains=part_str)[:10])
        candidates.sort(key=lambda x: len(x.part_name))
        better = candidates[0] if candidates else None
        print(f"CHOSEN (Length Sorted): {better.part_name if better else 'None'}")

if __name__ == "__main__":
    test_engine_match()
