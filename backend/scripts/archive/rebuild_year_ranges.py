
import os
import django
from django.db.models import Min, Max, Q

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.hollander.models import Make, Model, YearRange, HollanderInterchange

def rebuild_years():
    print("Clearing existing YearRange data...")
    YearRange.objects.all().delete()
    
    print("Fetching Models...")
    models = Model.objects.select_related('make').all()
    
    total_models = models.count()
    created_count = 0
    skipped_count = 0
    
    print(f"Processing {total_models} models...")
    
    # Mapping Dictionary: Make Name (DB) -> Hollander Code (Interchange)
    # Derived from Audit (Step 1192)
    MAKE_MAPPING = {
        "Chevrolet": ["GMC", "CH", "CO"],  # Chevy inside GMC (Verified Corvette=GMC)
        "GMC": ["GMC"],
        "Toyota": ["TY", "Toyota"],
        "Mazda": ["MZ", "Mazda"],
        "Volkswagen": ["VW", "Volkswagen"],
        "Mercedes-Benz": ["MB", "Mercedes"],
        "Honda": ["HA", "Honda"],
        "Jeep": ["JP", "Jeep"],
        "Mitsubishi": ["MU", "Mitsubishi"],
        "Volvo": ["VA", "VL", "Volvo"],
        "Infiniti": ["IF", "Infiniti"],
        "Suzuki": ["SZ", "Suzuki"],
        "Porsche": ["PR", "Porsche"],
        "Rover": ["RV", "Rover"], # Or RV might be Land Rover?
        "Daewoo": ["DW", "Daewoo"],
        "Daihatsu": ["DH", "Daihatsu"],
        "Geo": ["GN", "Geo"],
        "Isuzu": ["Isuzu"],
        "Jaguar": ["Jaguar"],
        "Lexus": ["Lexus"],
        "BMW": ["BMW"],
        "Audi": ["Audi"],
        "Kia": ["Kia"],
        "Hyundai": ["Hyundai"],
        "Subaru": ["SU", "Subaru"], # Guessing SU if exists, or standard
        "Saab": ["SA", "Saab"],
        "Saturn": ["Saturn"],
    }

    batch_size = 100
    ranges_to_create = []
    
    for i, model_obj in enumerate(models):
        make_name = model_obj.make.make_name
        model_name = model_obj.model_name
        
        # Determine Code(s) to search
        target_codes = MAKE_MAPPING.get(make_name, [make_name])
        # If no mapping, use name itself (e.g. Ford, Chrysler)
        
        # Token Logic for Model Name
        
        # Exact match failed? Try Token Match (e.g. "10 Pickup" -> "C10 Pickup")
        # Split "10 Pickup" -> ["10", "Pickup"]
        # Query: model__icontains="10" AND model__icontains="Pickup"
        tokens = [t for t in model_name.split() if len(t) > 0] # Keep strictly everything to be safe, or filter short words?
        # Actually filter single char non-digits? No, "M 3" -> "M" "3".
        if not tokens: tokens = [model_name]

        from django.db.models import Q
        q_tokens = Q()
        for t in tokens:
            q_tokens &= Q(model__icontains=t)
            
        qs = HollanderInterchange.objects.filter(make__in=target_codes).filter(q_tokens)
        
        if not qs.exists():
            # Strict Mode: Do NOT create fallback. If data is missing, years are missing.
            # This aligns with "show years present in db".
            skipped_count += 1
            if i % 100 == 0:
                print(f"  No data for {make_name} {model_name} (Skipping - No Fallback)")
            continue
            
        # Get Min Start and Max End
        # Exclude 0 only if there are other numbers, but generally 0 in start means unknown?
        # Actually usually Year Start is valid (e.g. 1995).
        # Year End: If 0, it often means "Current".
        
        # Check for presence of 0 in year_end (Current)
        has_open_end = qs.filter(year_end=0).exists()
        
        aggs = qs.aggregate(
            min_start=Min('year_start'),
            max_end=Max('year_end')
        )
        
        start = aggs['min_start'] or 0
        end = aggs['max_end'] or 0
        
        if start == 0 and end == 0:
            skipped_count += 1
            continue
            
        # Refine Start: If 0 is in min, but there are larger numbers, take the smallest non-zero?
        # Let's trust the aggregate. If min is 0, it means some part fits from year 0? Unlikely.
        # But let's enforce a reasonable floor if possible, e.g. 1900.
        if start < 1900 and start != 0:
             # Just keep what DB has
             pass
             
        # Refine End:
        if has_open_end:
            final_end = 2026 # Current/Future
        else:
            final_end = end
            if final_end < start and final_end != 0:
                final_end = start # Data correction
            if final_end == 0:
                final_end = 2026
                
        # Create YearRange
        ranges_to_create.append(YearRange(
            make=model_obj.make,
            model=model_obj,
            year_start=start,
            year_end=final_end
        ))
        created_count += 1
        
        if len(ranges_to_create) >= batch_size:
            YearRange.objects.bulk_create(ranges_to_create)
            ranges_to_create = []
            print(f"  Processed {i+1}/{total_models}...")
            
    # Create remaining
    if ranges_to_create:
        YearRange.objects.bulk_create(ranges_to_create)
        
    print("------------------------------------------------")
    print(f"Done. Rebuilt {created_count} Year Ranges.")
    print(f"Skipped {skipped_count} models (no interchange data found).")

if __name__ == '__main__':
    rebuild_years()
