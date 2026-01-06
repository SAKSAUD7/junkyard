
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.hollander.models import HollanderInterchange

print("--- C MAKES REPR ---")
# Get distinct makes starting with C
makes = list(HollanderInterchange.objects.filter(make__startswith='C').values_list('make', flat=True).distinct())
print(f"Distinct C Makes: {[repr(m) for m in makes]}")

print("--- COUNT ALL C ---")
count_c = HollanderInterchange.objects.filter(make__startswith='C').count()
print(f"Total Records Starting with 'C': {count_c}")

# Check 'Chev' case insensitive
count_icontains = HollanderInterchange.objects.filter(make__icontains='evrol').count()
print(f"Records containing 'evrol': {count_icontains}")
