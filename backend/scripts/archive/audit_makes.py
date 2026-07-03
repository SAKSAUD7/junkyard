
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.hollander.models import HollanderInterchange

print("--- MAKE AUDIT ---")
# Get counts
from django.db.models import Count
makes = HollanderInterchange.objects.values('make').annotate(total=Count('id')).order_by('-total')

output_file = "make_audit_results.txt"
with open(output_file, 'w') as f:
    f.write(f"Total Records: {HollanderInterchange.objects.count()}\n")
    f.write("-" * 40 + "\n")
    for m in makes:
        line = f"{m['make']}: {m['total']}"
        print(line)
        f.write(line + "\n")

print(f"\nWritten to {output_file}")
