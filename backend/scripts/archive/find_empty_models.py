import os
import django
import sys

sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.hollander.models import Make, Model, PartPricing, HollanderMakeModelRef

print('Finding all models with NO data...\n')

all_models = Model.objects.all().select_related('make')
empty_models = []

for model in all_models:
    # Check inventory
    has_inventory = PartPricing.objects.filter(model_ref=model).exists()
    
    # Check catalog (search for model name in refs)
    has_catalog = HollanderMakeModelRef.objects.filter(h_model__icontains=model.model_name).exists()
    
    if not has_inventory and not has_catalog:
        empty_models.append(f"{model.make.make_name} - {model.model_name}")

print(f'Total models with NO data: {len(empty_models)}\n')
print('Empty models by make:')

# Group by make
from collections import defaultdict
by_make = defaultdict(list)
for entry in empty_models:
    make, model = entry.split(' - ')
    by_make[make].append(model)

for make in sorted(by_make.keys()):
    print(f'\n{make}:')
    for model in sorted(by_make[make]):
        print(f'  - {model}')
