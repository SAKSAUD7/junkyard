import os
import sys
import django

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.hollander.models import Zipcode

print("=" * 80)
print("ZIPCODE DATABASE - STATE ANALYSIS")
print("=" * 80)

# Get all unique states from zipcode database
states = Zipcode.objects.values_list('state_abbr', flat=True).distinct().order_by('state_abbr')

print(f"\nTotal unique states in database: {states.count()}\n")

print("States found:")
print("-" * 80)
for state in states:
    count = Zipcode.objects.filter(state_abbr=state).count()
    print(f"{state}: {count} zipcodes")

print("\n" + "=" * 80)
print("STATE LIST FOR FRONTEND:")
print("=" * 80)
print("\nconst US_STATES = [")
state_list = list(states)
for i, state in enumerate(state_list):
    if i < len(state_list) - 1:
        print(f"    '{state}',")
    else:
        print(f"    '{state}'")
print("]")
