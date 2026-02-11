import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.hollander.models import HollanderInterchange, PartPricing

# Sample Hollander data for testing
sample_data = [
    {
        'hollander_number': '601-00181',
        'year_start': 1972,
        'year_end': 1976,
        'make': 'AMC',
        'model': 'Ambassador',
        'part_type': 'Alternator',
        'part_name': 'Alternator Assembly',
        'options': '62 Amp',
    },
    {
        'hollander_number': '20011',
        'year_start': 2013,
        'year_end': 2017,
        'make': 'Honda',
        'model': 'Accord',
        'part_type': 'Engine',
        'part_name': 'Engine Assembly',
        'options': 'V6 3.5L',
    },
    {
        'hollander_number': '30045',
        'year_start': 2010,
        'year_end': 2015,
        'make': 'Toyota',
        'model': 'Camry',
        'part_type': 'Transmission',
        'part_name': 'Transmission Assembly',
        'options': 'Automatic 4-Speed',
    },
    {
        'hollander_number': '17892',
        'year_start': 2005,
        'year_end': 2010,
        'make': 'Ford',
        'model': 'F-150',
        'part_type': 'Starter',
        'part_name': 'Starter Motor',
        'options': '12V',
    },
    {
        'hollander_number': '52341',
        'year_start': 2008,
        'year_end': 2012,
        'make': 'Chevrolet',
        'model': 'Silverado',
        'part_type': 'Radiator',
        'part_name': 'Radiator Assembly',
        'options': 'Aluminum',
    },
]

print("=" * 60)
print("IMPORTING SAMPLE HOLLANDER DATA")
print("=" * 60)

created_count = 0
existing_count = 0

for data in sample_data:
    record, created = HollanderInterchange.objects.get_or_create(
        hollander_number=data['hollander_number'],
        part_type=data['part_type'],
        defaults=data
    )
    if created:
        print(f"✓ Created: {record.hollander_number} - {record.part_type} ({record.make} {record.model})")
        created_count += 1
    else:
        print(f"- Already exists: {record.hollander_number}")
        existing_count += 1

print("\n" + "=" * 60)
print(f"IMPORT COMPLETE")
print(f"  Created: {created_count}")
print(f"  Already existed: {existing_count}")
print(f"  Total in database: {HollanderInterchange.objects.count()}")
print("=" * 60)

# Test query
print("\nTesting query for 1974 AMC Ambassador Alternator...")
test_results = HollanderInterchange.objects.filter(
    year_start__lte=1974,
    year_end__gte=1974,
    make__iexact='AMC',
    model__icontains='Ambassador',
    part_type__iexact='Alternator'
)

if test_results.exists():
    for result in test_results:
        print(f"  Found: {result.hollander_number} - {result.options}")
else:
    print("  No results found")
