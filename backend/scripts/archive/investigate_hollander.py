"""
Hollander Architecture Investigation Script
Run: python manage.py shell < investigate_hollander.py
"""
import django
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

from apps.hollander.models import PartPricing, HollanderInterchange, HollanderIndex, PartType, HollanderPartRef

print("=" * 80)
print("HOLLANDER ARCHITECTURE INVESTIGATION")
print("=" * 80)

# 1. BMW 530e Assembly 2019 — the exact example from the screenshot
print("\n[1] BMW 530e Assembly 2019 records in PartPricing:")
q = PartPricing.objects.filter(
    make='BMW', model='530e', part_name='Assembly',
    year_start__lte=2019, year_end__gte=2019
).order_by('hollander_number')
print(f"    Total records: {q.count()}")
print()
seen_hn = set()
hn_data = {}
for r in q[:50]:
    opts = r.get_all_options()
    print(f"    HN={r.hollander_number} | yr={r.year_start}-{r.year_end} | opts=[{opts}]")
    seen_hn.add(r.hollander_number)
    hn_data[r.hollander_number] = {
        'opts': opts,
        'yr': f"{r.year_start}-{r.year_end}",
        'option_fields': {
            'opt1': r.option1, 'opt2': r.option2, 'opt3': r.option3,
            'opt4': r.option4, 'opt5': r.option5, 'opt6': r.option6,
            'opt7': r.option7, 'opt8': r.option8, 'opt9': r.option9,
            'opt10': r.option10, 'opt11': r.option11,
        }
    }

print(f"\n    Unique Hollander Numbers: {len(seen_hn)}")
print(f"    Numbers: {sorted(seen_hn)}")

# 2. Compare individual option fields across records
print("\n[2] Per-field comparison of first 5 records:")
for i, r in enumerate(q[:5]):
    print(f"\n    Record {i+1}: HN={r.hollander_number}")
    for j in range(1, 12):
        v = getattr(r, f'option{j}', '')
        if v:
            print(f"        option{j} = '{v}'")

# 3. What unique option values appear per field?
print("\n[3] Unique option values per field (BMW 530e Assembly 2019):")
all_recs = list(q[:200])
for j in range(1, 12):
    vals = set(getattr(r, f'option{j}', '').strip() for r in all_recs if getattr(r, f'option{j}', '').strip())
    if vals:
        print(f"    option{j}: {sorted(vals)}")

# 4. Look at what distinguishes e.g. 100-10138A vs 100-10138B vs 100-10138C
print("\n[4] What differentiates A/B/C/D variants?")
for hn in sorted(seen_hn)[:8]:
    recs = list(PartPricing.objects.filter(
        make='BMW', model='530e', part_name='Assembly',
        year_start__lte=2019, year_end__gte=2019,
        hollander_number=hn
    )[:3])
    if recs:
        r = recs[0]
        opts = r.get_all_options()
        print(f"    {hn}: [{opts}]")

# 5. Total PartPricing row count
print(f"\n[5] Total PartPricing rows in DB: {PartPricing.objects.count():,}")
print(f"    Unique Hollander numbers: {PartPricing.objects.values('hollander_number').distinct().count():,}")

# 6. Sample options across the entire dataset to understand the option taxonomy
print("\n[6] Most common option1 values across ALL records:")
from django.db.models import Count
top_opts = PartPricing.objects.exclude(option1='').values('option1').annotate(n=Count('id')).order_by('-n')[:20]
for o in top_opts:
    print(f"    '{o['option1']}': {o['n']:,} records")

# 7. Check HollanderInterchange for same vehicle  
print("\n[7] HollanderInterchange records for BMW 530e Assembly 2019:")
hi = HollanderInterchange.objects.filter(
    make__icontains='BMW', model__icontains='530',
    year_start__lte=2019, year_end__gte=2019,
    part_type__icontains='Assembly'
)[:10]
print(f"    Found: {hi.count()} records")
for r in hi:
    print(f"    HN={r.hollander_number} | model={r.model} | yr={r.year_start}-{r.year_end} | opts=[{r.options}] | notes=[{r.notes}]")

# 8. Understand notes field in HollanderInterchange
print("\n[8] Sample notes field in HollanderInterchange:")
with_notes = HollanderInterchange.objects.exclude(notes='').values('hollander_number', 'notes')[:5]
for r in with_notes:
    print(f"    HN={r['hollander_number']}: notes=[{r['notes']}]")

print("\n" + "=" * 80)
print("INVESTIGATION COMPLETE")
print("=" * 80)
