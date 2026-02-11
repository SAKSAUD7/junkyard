import os
import django
import sys

# Add project root to path if needed (though usually current dir is fine)
sys.path.append(os.getcwd())

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.hollander.models import HollanderMakeModelRef, HollanderIndex

def test_mercedes():
    print("Testing Mercedes 190 Logic...")
    
    # 1. Simulate finding the Ref
    # Local model is "190E", so we search for "190"
    search_term = "190" 
    
    refs = HollanderMakeModelRef.objects.filter(
        h_make='MERCEDES', 
        h_model__icontains=search_term
    )
    
    found_models = list(refs.values_list('h_model', flat=True))
    print(f"Refs matching '{search_term}': {found_models}")
    
    if not found_models:
        print("No refs found.")
        return

    # 2. Simulate finding Index entries
    index = HollanderIndex.objects.filter(
        model_nm__in=found_models
    ).values('model_nm', 'begin_year')
    
    years = sorted(list(set(i['begin_year'] for i in index)))
    print(f"Unique Years found: {years}")

if __name__ == "__main__":
    test_mercedes()
