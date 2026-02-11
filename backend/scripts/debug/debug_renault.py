import os
import django
import sys

sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.hollander.models import Make, Model, HollanderMakeModelRef, HollanderIndex

print('=== RENAULT ANALYSIS ===\n')

# Get Renault make
renault = Make.objects.filter(make_name='Renault').first()
if not renault:
    print('Renault make not found!')
    exit()

print(f'Found Make: {renault.make_name} (ID: {renault.make_id})')

# Get all Renault models
models = Model.objects.filter(make=renault)
print(f'\nLocal Renault Models ({models.count()} total):')
for m in models:
    print(f'  - {m.model_name}')

# Check Hollander refs for "Renault"
print('\n--- Checking HollanderMakeModelRef for "Renault" ---')
renault_refs = HollanderMakeModelRef.objects.filter(h_make__icontains='Renault')[:20].values('h_make', 'h_model')
print(f'Found {renault_refs.count()} refs with h_make containing "Renault":')
for ref in renault_refs[:10]:
    print(f'  {ref["h_make"]} -> {ref["h_model"]}')

# Check specific models
print('\n--- Checking specific models ---')
test_models = ['Clio', 'Espace', 'Alliance']

for model_name in test_models:
    print(f'\n{model_name}:')
    
    # Search in refs
    refs = HollanderMakeModelRef.objects.filter(h_model__icontains=model_name)[:5].values('h_make', 'h_model')
    print(f'  Refs found: {refs.count()}')
    for ref in refs:
        print(f'    - {ref["h_make"]} -> {ref["h_model"]}')
    
    # Search in index
    if refs:
        h_models = [r['h_model'] for r in refs]
        index_entries = HollanderIndex.objects.filter(model_nm__in=h_models).values('model_nm', 'begin_year', 'end_year').distinct()[:5]
        print(f'  Index entries: {index_entries.count()}')
        for entry in index_entries:
            print(f'    - {entry["model_nm"]}: {entry["begin_year"]}-{entry["end_year"]}')
