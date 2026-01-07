import django
import os
import sys

sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.hollander.models import PartPricing

print(f'Total records: {PartPricing.objects.count():,}')
print('\nSample records with proper make names:')
samples = PartPricing.objects.all()[:10]
for s in samples:
    print(f'  {s.hollander_number}: {s.make} {s.model} {s.part_name} ({s.year_start}-{s.year_end})')
    if s.option1:
        print(f'    Options: {s.get_all_options()}')

print(f'\nUnique makes: {PartPricing.objects.values("make").distinct().count()}')
print('\nMake distribution:')
makes = PartPricing.objects.values('make').annotate(count=django.db.models.Count('id')).order_by('-count')[:10]
for make in makes:
    print(f'  {make["make"]}: {make["count"]:,} records')
