
import os
import django

# Setup Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from apps.hollander.models import PartType, HollanderPartRef

def analyze_mapping():
    print("--- Analyzing Part Name Mapping ---")
    
    # 1. Get all Dropdown Names (PartType)
    dropdown_names = set(PartType.objects.values_list('part_name', flat=True))
    print(f"Total PartType (Dropdown) Names: {len(dropdown_names)}")
    
    # 2. Get all Catalog Names (HollanderPartRef)
    catalog_names = set(HollanderPartRef.objects.values_list('part_name', flat=True))
    print(f"Total Catalog (Ref) Names: {len(catalog_names)}")
    
    # 3. Direct Intersect
    matches = dropdown_names.intersection(catalog_names)
    print(f"Exact Matches: {len(matches)}")
    
    # 4. Mismatches (Catalog names that are NOT in Dropdown)
    mismatches = catalog_names - dropdown_names
    print(f"Catalog Names NOT in Dropdown: {len(mismatches)}")
    
    print("\n--- Sample Mismatches (Catalog -> ? Dropdown) ---")
    for name in list(mismatches)[:20]:
        # Try to find what it SHOULD map to
        # e.g. "Engine Assembly" -> "Engine"
        found = False
        candidates = []
        for d in dropdown_names:
            if d in name or name in d:
                candidates.append(d)
                
        print(f"'{name}' => Candidates: {candidates}")

if __name__ == "__main__":
    analyze_mapping()
