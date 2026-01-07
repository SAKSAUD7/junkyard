
import os
import django
from django.db.models import Q

# Setup Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from apps.hollander.models import HollanderIndex, HollanderMakeModelRef, Model

def debug_lookup():
    print("--- Debugging Hollander Index Lookup Keys ---")
    
    queries = ["325i", "BMW 325i", "3 Series", "BMW 3 Series"]
    
    for q in queries:
        count = HollanderIndex.objects.filter(model_nm__iexact=q).count()
        print(f"Query '{q}': {count} records found.")
        
    print("\n--- Sampling '3...' models from Index ---")
    samples = list(HollanderIndex.objects.filter(model_nm__startswith='3').values_list('model_nm', flat=True).distinct()[:20])
    print(samples)

    print("\n--- Analyzing 'Accord' mapping ---")
    # We saw earlier Ref 523 (ACCORD) -> Index had 0 records for '523'
    # Try query Index for 'Accord'
    c_accord = HollanderIndex.objects.filter(model_nm__iexact='Accord').count()
    print(f"Index 'Accord': {c_accord}")
    
    # Try query Index for '523'
    c_523 = HollanderIndex.objects.filter(model_nm='523').count()
    print(f"Index '523': {c_523}")


if __name__ == "__main__":
    debug_lookup()
