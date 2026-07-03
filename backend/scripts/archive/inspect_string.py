
import os
import django

# Setup Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from apps.hollander.models import HollanderIndex

def inspect_strings():
    print("--- Inspecting 'BMW' Index Keys ---")
    
    # Query by name contains
    items = HollanderIndex.objects.filter(model_nm__icontains='325i').values_list('model_nm', flat=True).distinct()[:10]
    
    for nm in items:
        if '325i' in nm:
            print(f"Original: '{nm}'")
            print(f"Repr:     {repr(nm)}")
            print(f"Length:   {len(nm)}")
            
            # Check equality logic
            target = "BMW 325i"
            print(f"Equals '{target}'? {nm == target}")
            print(f"IExact matches? {nm.lower() == target.lower()}")
            
            # Print chars
            print("Chars:", [ord(c) for c in nm])

if __name__ == "__main__":
    inspect_strings()
