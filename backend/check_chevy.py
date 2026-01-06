
import os
import django
from django.db.models import Q

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.hollander.models import HollanderInterchange

print("--- CHEVROLET CHECK ---")
# Try different variatons
count_starts = HollanderInterchange.objects.filter(make__startswith='Chev').count()
print(f"StartsWith 'Chev' Count: {count_starts}")

count_contains = HollanderInterchange.objects.filter(make__icontains='Chev').count()
print(f"Contains 'Chev' Count: {count_contains}")

count_ch = HollanderInterchange.objects.filter(make='CH').count()
print(f"Equals 'CH' Count: {count_ch}")

# Listing Makes surrounding C
print("\n--- DISTINCT MAKES (A-D) ---")
makes = list(HollanderInterchange.objects.order_by('make').values_list('make', flat=True).distinct())
# Filter for A-D manually to be safe
subset = [m for m in makes if m and m[0].upper() < 'E']
print(str(subset)[:1000]) # Print first 1000 chars

# Test Token Logic
print("\n--- TOKEN MATCH TEST for '10 Pickup' ---")
if count_starts > 0:
    target_make = 'Chevrolet' # Assumption, relying on query results
    # Use filtered query
    tokens = ["10", "Pickup"]
    q = Q()
    for t in tokens:
        q &= Q(model__icontains=t)
        
    matches = HollanderInterchange.objects.filter(make__startswith='Chev').filter(q).values('model').distinct()[:5]
    print(f"Matches for '10' + 'Pickup': {list(matches)}")
