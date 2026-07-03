"""
Phase 3: Design the Question Tree algorithm + test on real data
"""
from apps.hollander.models import PartPricing

def build_question_tree(candidates):
    """
    Given a list of PartPricing records (candidates),
    build an ordered list of questions to ask the customer.
    
    Returns: list of {'slot': int, 'type': 'yesno'|'choice', 'feature': str, 'values': list}
    """
    questions = []
    
    for j in range(1, 12):
        vals_in_slot = [getattr(r, f'option{j}', '').strip() for r in candidates]
        unique_vals = sorted(set(v for v in vals_in_slot if v))
        
        if not unique_vals:
            continue
        
        if len(unique_vals) == 1:
            # All candidates share this value — constant, skip
            continue
        
        # Detect paired options (X vs Without X)
        paired = set()
        pairs = []
        standalone = []
        
        for v in unique_vals:
            if v in paired:
                continue
            without_v = f'Without {v}'
            if without_v in unique_vals:
                pairs.append({'feature': v, 'pos': v, 'neg': without_v})
                paired.add(v)
                paired.add(without_v)
            elif not v.startswith('Without '):
                standalone.append(v)
        
        # Handle Without X values with no positive counterpart
        orphan_withouts = [v for v in unique_vals if v.startswith('Without ') and v not in paired]
        
        for pair in pairs:
            questions.append({
                'slot': j,
                'type': 'yesno',
                'feature': pair['feature'],
                'question': f"Does your {pair['feature']} apply?",
                'yes_label': pair['pos'],
                'no_label': pair['neg'],
                'values': [pair['pos'], pair['neg']]
            })
        
        if standalone:
            questions.append({
                'slot': j,
                'type': 'choice',
                'feature': f'option{j}',
                'question': 'Which option applies to your vehicle?',
                'values': standalone
            })
    
    return questions


def filter_candidates(candidates, slot, value):
    """Filter candidates to those matching the given slot value."""
    return [r for r in candidates if getattr(r, f'option{slot}', '').strip() == value]


def simulate_resolution(make, model, part_name, year, user_answers=None):
    """
    Simulate the progressive resolution of Hollander Number.
    user_answers = [(slot, value), ...]
    """
    candidates = list(PartPricing.objects.filter(
        make=make, model=model, part_name=part_name,
        year_start__lte=year, year_end__gte=year
    ))
    
    print(f"\n{'='*60}")
    print(f"Part: {make} {model} {part_name} {year}")
    print(f"Starting candidates: {len(candidates)}")
    
    if user_answers:
        for slot, value in user_answers:
            candidates = filter_candidates(candidates, slot, value)
            print(f"  After answering opt{slot}='{value}': {len(candidates)} candidates")
    
    remaining_hns = list(set(r.hollander_number for r in candidates))
    print(f"Remaining Hollander Numbers: {len(remaining_hns)}")
    
    if len(remaining_hns) == 1:
        print(f"✅ RESOLVED: {remaining_hns[0]}")
    elif len(remaining_hns) == 0:
        print("❌ No match found!")
    else:
        print(f"⚠️  Still {len(remaining_hns)} candidates: {sorted(remaining_hns)[:5]}...")
        # What more questions can we ask?
        next_q = build_question_tree(candidates)
        if next_q:
            print(f"   Next questions available: {len(next_q)}")
            for q in next_q[:3]:
                print(f"   - {q['type']}: {q.get('question','?')} -> values: {q['values']}")
        else:
            print("   No more questions possible — submit all as candidates")
    
    return candidates


# Test 1: BMW 530e Assembly 2019
print("TEST 1: No user answers (all 20 variants)")
simulate_resolution('BMW', '530e', 'Assembly', 2019)

print("\nTEST 2: User says Turn Signal = Led (Icon Headlamp)")
simulate_resolution('BMW', '530e', 'Assembly', 2019, user_answers=[(3, 'Led Turn Signal (Icon Headlamp)')])

print("\nTEST 3: User says Turn Signal = Led AND has M-aerodynamic Package")
simulate_resolution('BMW', '530e', 'Assembly', 2019, user_answers=[
    (3, 'Led Turn Signal (Icon Headlamp)'),
    (4, 'M-aerodynamic Package'),
])

print("\nTEST 4: Full resolution path")
simulate_resolution('BMW', '530e', 'Assembly', 2019, user_answers=[
    (3, 'Led Turn Signal (Icon Headlamp)'),
    (4, 'M-aerodynamic Package'),
    (5, 'Night Vision'),
    (6, 'Adaptive Cruise'),
])

print("\nTEST 5: Full resolution path - different variant")
simulate_resolution('BMW', '530e', 'Assembly', 2019, user_answers=[
    (3, 'Incandescent Turn Signal'),
    (4, 'Without M-aerodynamic Package'),
    (5, 'Without Park Assist'),
    (6, 'Without Night Vision'),
])

# Test what the question tree looks like
print("\n\n=== QUESTION TREE for BMW 530e Assembly 2019 ===")
candidates = list(PartPricing.objects.filter(
    make='BMW', model='530e', part_name='Assembly',
    year_start__lte=2019, year_end__gte=2019
))
tree = build_question_tree(candidates)
print(f"Total questions generated: {len(tree)}")
for i, q in enumerate(tree):
    print(f"  Q{i+1} (slot={q['slot']}, type={q['type']}): {q.get('question', q.get('feature'))}")
    print(f"       values: {q['values']}")
