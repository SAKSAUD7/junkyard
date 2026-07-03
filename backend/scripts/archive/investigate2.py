"""
Phase 2: Deep option tree analysis
"""
from apps.hollander.models import PartPricing
from django.db.models import Count

def analyze_options_for_part(make, model, part_name, year):
    recs = list(PartPricing.objects.filter(
        make=make, model=model, part_name=part_name,
        year_start__lte=year, year_end__gte=year
    ))
    if not recs:
        print(f'No records found for {make} {model} {part_name} {year}')
        return []
    
    unique_hns = set(r.hollander_number for r in recs)
    print(f'{make} {model} {part_name} {year}: {len(recs)} records, {len(unique_hns)} unique HNs')
    
    questions = []
    for j in range(1, 12):
        vals = sorted(set(
            getattr(r, f'option{j}', '').strip() 
            for r in recs 
            if getattr(r, f'option{j}', '').strip()
        ))
        if not vals:
            continue
        if len(vals) == 1:
            print(f'  opt{j} CONSTANT: "{vals[0]}" (no question needed)')
        else:
            # Detect Without-pairs
            pairs = []
            unpaired = []
            seen = set()
            for v in vals:
                if v in seen: continue
                seen.add(v)
                without = f'Without {v}'
                if without in vals:
                    pairs.append((v, without))
                    seen.add(without)
                elif v.startswith('Without '):
                    base = v[8:]
                    if base not in vals:
                        unpaired.append(v)
                else:
                    unpaired.append(v)
            
            for pos, neg in pairs:
                print(f'  opt{j} YES/NO: "Does your car have [{pos}]?" (Yes={pos}, No={neg})')
                questions.append({'slot': j, 'type': 'yesno', 'label': pos, 'pos': pos, 'neg': neg})
            if unpaired:
                print(f'  opt{j} MULTI: "Which applies?" {unpaired}')
                questions.append({'slot': j, 'type': 'choice', 'options': unpaired})
    
    return questions

print("=" * 70)
print("BMW 530e Assembly 2019")
print("=" * 70)
q1 = analyze_options_for_part('BMW', '530e', 'Assembly', 2019)

print()
print("=" * 70)
print("Mercedes Benz C-Class Wheel 2019")
print("=" * 70)
q2 = analyze_options_for_part('Mercedes Benz', 'C-Class', 'Wheel', 2019)

print()
print("=" * 70)
print("Finding a Porsche 911 Assembly 2019")
print("=" * 70)
q3 = analyze_options_for_part('Porsche', '911', 'Assembly', 2019)

print()
print("=" * 70)
print("Toyota Camry Headlamp 2019 (simpler case)")
print("=" * 70)
q4 = analyze_options_for_part('Toyota', 'Camry', 'Headlamp', 2019)

print()
print("=" * 70)
print("Understanding: what is the MAXIMUM options needed per part?")
print("=" * 70)
# Find part with most variants
top_variants = PartPricing.objects.filter(year_start__lte=2019, year_end__gte=2019).values(
    'make', 'model', 'part_name'
).annotate(n=Count('hollander_number', distinct=True)).order_by('-n')[:5]
for t in top_variants:
    print(f"  {t['make']} {t['model']} {t['part_name']}: {t['n']} variants")

print()
print("=" * 70)
print("How does the BACKEND currently serve variants?")
print("=" * 70)
# In bulk_views.py, the variants per part object is:
# {'hollander_number': ..., 'options': 'opt1, opt2, opt3, ...'}
# The frontend then pools ALL options from all variants into a flat tag list
# This is the fundamental problem — all options from all records are shown at once
# without the decision tree structure

# The solution: Instead of flat tags, detect and expose the question structure
print("Current approach: flat tag pool from all variants (broken)")
print("Better approach: build a question tree per-position")
print()

# Now let's see what the frontend actually gets:
recs = list(PartPricing.objects.filter(
    make='BMW', model='530e', part_name='Assembly',
    year_start__lte=2019, year_end__gte=2019
))
all_opts = set()
for r in recs:
    for j in range(1, 12):
        v = getattr(r, f'option{j}', '').strip()
        if v:
            all_opts.add(v)

print(f"Flat tag pool for BMW 530e Assembly 2019: {sorted(all_opts)}")
print(f"That's {len(all_opts)} tags presented at once — confusing!")
