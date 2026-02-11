
import os
import django

# Setup Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from apps.hollander.models import PartPricing, Make, Model

def debug_kia():
    print("--- Debugging Kia Linkage ---")
    
    # 1. Get Make Object
    try:
        kia = Make.objects.get(make_name='Kia')
        print(f"Make Found: {kia} (ID: {kia.id})")
    except Make.DoesNotExist:
        print("ERROR: Kia Make not found!")
        return

    # 2. Check Unlinked Records for this Make ID
    unlinked_qs = PartPricing.objects.filter(make_ref=kia, model_ref__isnull=True)
    count = unlinked_qs.count()
    print(f"Unlinked Kia Records: {count}")
    
    if count == 0:
        print("All Kia records are linked! (Maybe previous run worked and just didn't print?)")
        # Check a sample anyway
        sample = PartPricing.objects.filter(make_ref=kia).first()
        print(f"Sample Linked: {sample.model_ref} (from string '{sample.model}')")
        return

    # 3. Inspect Distinct Legacy Model Strings
    legacy_models = unlinked_qs.values_list('model', flat=True).distinct().order_by()
    print(f"Distinct Unlinked Strings ({len(legacy_models)}):")
    for m in legacy_models:
        print(f"  '{m}' (Len: {len(m)}, Repr: {repr(m)})")

    # 4. Inspect Reference Models
    ref_models = Model.objects.filter(make=kia)
    print(f"\nReference Models ({ref_models.count()}):")
    model_map = {}
    for m in ref_models:
        print(f"  '{m.model_name}' (Len: {len(m.model_name)}, Repr: {repr(m.model_name)})")
        model_map[m.model_name.lower()] = m

    # 5. Simulate Matching
    print("\nMatching Logic Test:")
    for m_str in legacy_models:
        clean = m_str.strip().lower()
        match = model_map.get(clean)
        print(f"  '{m_str}' -> clean '{clean}' -> Match? {match}")

if __name__ == "__main__":
    debug_kia()
