
import os
import django
from django.core.management import call_command
from io import StringIO

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.hollander.models import Make, Model, YearRange, HollanderInterchange, PartType
from apps.leads.models import Lead

print("--- MIGRATIONS ---")
out = StringIO()
call_command('showmigrations', stdout=out)
# Filter specifically for 'hollander' and 'leads' to be concise
lines = out.getvalue().split('\n')
for line in lines:
    if 'hollander' in line or 'leads' in line or '[X]' in line:
         # simple filter to show status
         pass
print(out.getvalue()) # Print all for frankness

print("--- DATA COUNTS ---")
print(f"Makes: {Make.objects.count()}")
print(f"Models: {Model.objects.count()}")
print(f"YearRanges: {YearRange.objects.count()}")
print(f"PartTypes: {PartType.objects.count()}")
print(f"Interchange Records: {HollanderInterchange.objects.count()}")

print("--- LEAD DATA ---")
last_lead = Lead.objects.last()
if last_lead:
    print(f"Last Lead ID: {last_lead.id}")
    print(f"Inputs: {last_lead.year} {last_lead.make} {last_lead.model} {last_lead.part}")
    print(f"Hollander #: {last_lead.hollander_number}")
    print(f"Options: {last_lead.options}")
else:
    print("No leads found.")
