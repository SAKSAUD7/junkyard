"""
Bulk Vehicle Data API Endpoint
Returns complete hierarchical data for a make in a single request
Eliminates sequential API calls and loading delays
"""
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Q
from django.core.cache import cache
from .models import Make, Model, PartPricing, PartType, HollanderIndex
from .views import query_catalog_index

CACHE_TTL = 60 * 60 * 24  # 24 hours


@api_view(['GET'])
def get_vehicle_data_bulk(request, make_id):
    """
    Return complete hierarchical data for a make:
    Make → Models → Years → Parts → Hollander/Options
    
    OPTIMIZED VERSION: Uses 3 bulk queries + 24-hour server-side cache.
    """
    try:
        make_id = int(make_id)

        # --- Serve from cache if available ---
        cache_key = f'bulk_vehicle_data_v3_{make_id}'
        cached = cache.get(cache_key)
        if cached is not None:
            return Response(cached)

        make = Make.objects.filter(make_id=make_id).first()
        
        if not make:
            return Response({'error': 'Make not found'}, status=404)
        
        # 1. Fetch ALL Models for this Make (Query #1)
        models = list(Model.objects.filter(make=make).values('model_id', 'model_name').order_by('model_name'))
        
        # Initialize result structure
        result = {
            'make_id': make.make_id,
            'make_name': make.make_name,
            'models': []
        }
        
        # Helpers for mapping
        model_map = {m['model_id']: {'model_id': m['model_id'], 'model_name': m['model_name'], 'years': [], 'parts': {}} for m in models}
        model_ids = [m['model_id'] for m in models]
        
        # 2. Fetch ALL PartPricing data for this Make (Query #2)
        # This gets us Years AND Parts in one go
        pricing_data = PartPricing.objects.filter(
            make_ref=make,
            part_type_ref__isnull=False
        ).values(
            'model_ref__model_id',
            'year_start',
            'year_end',
            'part_type_ref__part_id',
            'part_type_ref__part_name',
            'hollander_number',
            'option1', 'option2', 'option3', 'option4', 'option5', 
            'option6', 'option7', 'option8', 'option9', 'option10'
        )
        
        # Process Pricing Data in Memory
        for row in pricing_data:
            m_id = row['model_ref__model_id']
            if m_id not in model_map: continue
            
            # Add Years
            start, end = row['year_start'], row['year_end']
            if start and end:
                 s, e = max(1950, start), min(2030, end)
                 if s <= e:
                     # We can't easily add range to set without loop, but Python loop is fast
                     # Optimization: Just track min/max per model? 
                     # For now, let's just add the range end points and fill gaps later if needed?
                     # Better: Use a set for years per model
                     if 'year_set' not in model_map[m_id]: model_map[m_id]['year_set'] = set()
                     model_map[m_id]['year_set'].update(range(s, e + 1))
            
            # Add Parts (buckets by year)
            # This is tricky because one record spans multiple years.
            
            p_id_base = row['part_type_ref__part_id']
            h_num = row['hollander_number'] or ''
            options_str = ', '.join(filter(None, [
                row['option1'], row['option2'], row['option3'], row['option4'], 
                row['option5'], row['option6'], row['option7'], row['option8'], 
                row['option9'], row['option10']
            ]))
            
            # IMPORTANT: Keep part_name CLEAN (no options appended).
            # Options are a separate field; the frontend resolves them from the composite key.
            p_name = row['part_type_ref__part_name']
            
            # Use a unique key so we don't deduplicate variations of the same part
            unique_part_key = f"{p_id_base}_{h_num}"

            # We construct a part object with clean name + separate options
            part_obj = {
                'part_id': unique_part_key,
                'part_name': p_name,           # Clean name — no options appended
                'hollander_number': h_num,
                'options': options_str          # Options stored separately
            }
            
            # Add to all relevant years for this model
            if s <= e:
                for y in range(s, e + 1):
                    if y < 1980: continue
                    
                    y_str = str(y)
                    if y_str not in model_map[m_id]['parts']:
                        model_map[m_id]['parts'][y_str] = {}
                    
                    base_key = str(p_id_base)
                    if base_key not in model_map[m_id]['parts'][y_str]:
                        model_map[m_id]['parts'][y_str][base_key] = {
                            'part_id': p_id_base,
                            'part_name': p_name,
                            'variants': []
                        }
                    
                    # Add this variant (deduplicate by hollander_number)
                    existing = {v['hollander_number'] for v in model_map[m_id]['parts'][y_str][base_key]['variants']}
                    if h_num not in existing:
                        model_map[m_id]['parts'][y_str][base_key]['variants'].append({
                            'hollander_number': h_num,
                            'options': options_str
                        })

        # 3. Fallback: Hollander Index (Query #3 & #4 - Catalog Years)
        # Robust Logic: Bridge Local Model Names -> Hollander Ref Names -> Hollander Index
        
        from django.db.models import Q, Count
        import re
        from .models import HollanderMakeModelRef
        
        # A. Resolve Relevant Hollander Makes (Multiple Allowed)
        # Some local Makes (like AMC) map to multiple Hollander Makes (Renault, AM General, Eagle)
        # Strategy: Identify ALL potential Hollander Makes associated with these models
        
        target_h_makes = set()
        
        # 1. Try direct name match (High Confidence)
        h_make_guess = HollanderMakeModelRef.objects.filter(h_make__icontains=make.make_name).first()
        if h_make_guess:
            target_h_makes.add(h_make_guess.h_make)
            
        # 2. Scan ALL models (Global Search)
        # Optimization: Check chunks of names
        # IMPORTANT: Include "Stripped" names (Series) in the search!
        # "190E" won't find "MERCEDES 190" unless we search for "190".
        
        search_terms = set()
        for m in models:
             m_name = m['model_name'].strip()
             if len(m_name) > 1: # "M3" is short but valid
                 search_terms.add(m_name)
                 
                 # Strip suffix logic (replicated from Smart Match loop)
                 if re.match(r'^\d+', m_name):
                     base_series = re.sub(r'[a-zA-Z\W]+$', '', m_name)
                     if len(base_series) >= 2 and base_series != m_name:
                         search_terms.add(base_series)
        
        search_list = list(search_terms)
        
        from django.db.models import Q
        
        # Batch query for refs
        valid_refs = []
        if search_list:
            chunk_size = 20
            all_refs = []
            
            for i in range(0, len(search_list), chunk_size):
                chunk = search_list[i:i+chunk_size]
                query = Q()
                for term in chunk:
                    query |= Q(h_model__icontains=term)
                
                refs = list(HollanderMakeModelRef.objects.filter(query).values('h_model', 'h_make'))
                all_refs.extend(refs)
            
            valid_refs = all_refs

        # C. smart Match: Local Model -> [List of Hollander Model Names]
        # ... logic continues using valid_refs (which is now broader)


        # C. smart Match: Local Model -> [List of Hollander Model Names]
        model_to_h_models = {} 
        h_model_list = set()
        
        # Pre-process Refs for speed
        # We want to match against "190" inside "MERCEDES 190"
        
        for m in models:
            m_id = m['model_id']
            m_name = m['model_name'].upper().strip()
            model_to_h_models[m_id] = []
            
            # Smart Token Extraction
            # 1. Exact Name
            tokens = [m_name]
            
            # 2. Base Series (Strip alpha suffix: "190E" -> "190", "325i" -> "325")
            # Regex: Remove letters from end, keep digits. 
            # Only do this if the name starts with digits (common for luxury cars)
            if re.match(r'^\d+', m_name):
                 base_series = re.sub(r'[a-zA-Z\W]+$', '', m_name)
                 if len(base_series) >= 2 and base_series != m_name:
                     tokens.append(base_series)
            
            # 3. Strip "Series" or "Class" words? (Maybe later)

            # Check tokens against valid refs
            for ref in valid_refs:
                h_name = ref['h_model'].upper()
                
                match_found = False
                for token in tokens:
                    # Logic: 
                    # If token is numeric/short ("190"), require word boundary or tight match?
                    # "MERCEDES 190" contains "190" -> YES.
                    # "MERCEDES 190" contains "190E" -> NO.
                    
                    # Search for token IN ref name
                    if token in h_name: 
                         match_found = True
                         break
                    # Search for ref name IN token (rare, e.g. "Alliance DL" vs "Alliance")
                    if h_name in m_name:
                         match_found = True
                         break
                
                if match_found:
                    model_to_h_models[m_id].append(ref['h_model'])
                    h_model_list.add(ref['h_model'])
        
        # D. Query Hollander Index for Years AND Parts
        catalog_entries = []
        if h_model_list:
            # We now need part_type_nbr as well
            catalog_entries = HollanderIndex.objects.filter(
                model_nm__in=list(h_model_list)
            ).values('model_nm', 'begin_year', 'end_year', 'part_type_nbr')
        
        # E. Resolve Part Names (Bulk)
        # Get all unique part codes from the result
        unique_part_codes = set(e['part_type_nbr'] for e in catalog_entries if e['part_type_nbr'])
        
        # Fetch Part Names from PartRef
        # Map: Code -> Part Name
        part_code_map = {}
        from .models import HollanderPartRef, PartType
        
        # 1. PRIMARY: Use PartType table - fully populated with all part names
        part_types = PartType.objects.filter(part_id__in=unique_part_codes).values('part_id', 'part_name')
        for r in part_types:
            part_code_map[str(r['part_id'])] = r['part_name']
        
        # 2. SUPPLEMENT: HollanderPartRef (may override with Hollander-specific names where available)
        refs = HollanderPartRef.objects.filter(part_code__in=unique_part_codes).values('part_code', 'part_name')
        for r in refs:
            if r['part_name']:  # Only override if HollanderPartRef has a valid name
                part_code_map[str(r['part_code'])] = r['part_name']
        
        # F. Merge Data back to Models
        # First, bulk-fetch HollanderInterchange records for the matched h_models
        # so we can fill in real hollander_number values (instead of blank placeholder)
        from .models import HollanderInterchange
        
        # Build a lookup: (h_model, part_type_code) -> hollander_number
        # We query all relevant HollanderInterchange records at once
        hinter_lookup = {}  # key: (model_nm_upper, part_type_code_str) -> hollander_number
        if h_model_list:
            hinter_records = HollanderInterchange.objects.filter(
                model__in=list(h_model_list)
            ).values('model', 'year_start', 'year_end', 'part_type', 'hollander_number')
            
            # Also try to get part type code -> name mapping from HollanderPartRef
            # We need to map part_type (name) in HollanderInterchange to part_type_nbr codes
            # HollanderInterchange.part_type is a name string like "Bumper Reinforcement - Front"
            # HollanderPartRef maps code -> name
            # Build reverse map: part_name -> code
            part_name_to_code = {v: k for k, v in part_code_map.items()}
            
            for rec in hinter_records:
                p_name = rec['part_type']
                p_code = part_name_to_code.get(p_name, '')
                if not p_code:
                    # Try partial match
                    for name, code in part_name_to_code.items():
                        if name and p_name and (name.lower() in p_name.lower() or p_name.lower() in name.lower()):
                            p_code = code
                            break
                key = (rec['model'].upper(), p_code, rec['year_start'], rec['year_end'])
                if key not in hinter_lookup and rec['hollander_number']:
                    hinter_lookup[key] = rec['hollander_number']
        
        # Organization: catalog_by_h_model[h_name] = [entries...]
        catalog_by_h_model = {}
        for entry in catalog_entries:
            nm = entry['model_nm']
            if nm not in catalog_by_h_model: catalog_by_h_model[nm] = []
            catalog_by_h_model[nm].append(entry)

        # Assign to Local Models
        for m_id, h_names in model_to_h_models.items():
            if not h_names: continue
            
            for h_name in h_names:
                if h_name in catalog_by_h_model:
                     for entry in catalog_by_h_model[h_name]:
                         start, end = entry['begin_year'], entry['end_year']
                         p_code = entry['part_type_nbr']
                         
                         if start and end:
                             s, e = max(1950, start), min(2030, end)
                             if s <= e:
                                 # 1. Add Years
                                 if 'year_set' not in model_map[m_id]: model_map[m_id]['year_set'] = set()
                                 model_map[m_id]['year_set'].update(range(s, e + 1))
                                 
                                 if p_code and p_code in part_code_map:
                                     p_name = part_code_map[p_code]
                                     
                                     # Try to resolve real Hollander number from HollanderInterchange lookup
                                     resolved_hollander = ''
                                     lookup_key = (h_name.upper(), p_code, s, e)
                                     if lookup_key in hinter_lookup:
                                         resolved_hollander = hinter_lookup[lookup_key]
                                     else:
                                         # Try a broader search with just model + part_code
                                         for (lm, lc, ls, le), lh in hinter_lookup.items():
                                             if lm == h_name.upper() and lc == p_code:
                                                 resolved_hollander = lh
                                                 break
                                     
                                     # Convert to int for frontend compatibility
                                     try:
                                         p_id_int = int(p_code)
                                     except (ValueError, TypeError):
                                         continue

                                     unique_part_key = f"{p_id_int}_{resolved_hollander}"

                                     # Create part object WITH real hollander_number
                                     p_obj = {
                                         'part_id': unique_part_key, 
                                         'part_name': p_name,
                                         'hollander_number': resolved_hollander,
                                         'options': ''
                                     }
                                     
                                     for y in range(s, e + 1):
                                         if y < 1980: continue
                                         
                                         y_str = str(y)
                                         if y_str not in model_map[m_id]['parts']:
                                             model_map[m_id]['parts'][y_str] = {}
                                         
                                         base_key = str(p_id_int)
                                         # Only add if PartPricing hasn't already provided this part
                                         if base_key not in model_map[m_id]['parts'][y_str]:
                                             model_map[m_id]['parts'][y_str][base_key] = {
                                                 'part_id': p_id_int,
                                                 'part_name': p_name,
                                                 'variants': []
                                             }
                                         
                                         existing = {v['hollander_number'] for v in model_map[m_id]['parts'][y_str][base_key]['variants']}
                                         if resolved_hollander not in existing:
                                             model_map[m_id]['parts'][y_str][base_key]['variants'].append({
                                                 'hollander_number': resolved_hollander,
                                                 'options': ''
                                             })
        
        # Final Assembly (Filter out empty models and merge duplicates by name)
        merged_models = {}
        for m_id, data in model_map.items():
            # Include ALL models for the make, even if they don't have parts/years
                
            m_name = data['model_name'].strip().upper()
            
            if m_name not in merged_models:
                merged_models[m_name] = {
                    'model_id': data['model_id'], # keep first model id
                    'model_name': data['model_name'],
                    'year_set': set(),
                    'parts': {}
                }
            
            # Merge years
            if 'year_set' in data:
                merged_models[m_name]['year_set'].update(data['year_set'])
                
            # Merge parts
            for y_key, p_dict in data.get('parts', {}).items():
                if y_key not in merged_models[m_name]['parts']:
                    merged_models[m_name]['parts'][y_key] = {}
                
                for p_key, p_data in p_dict.items():
                    if p_key not in merged_models[m_name]['parts'][y_key]:
                        merged_models[m_name]['parts'][y_key][p_key] = {
                            'part_id': p_data['part_id'],
                            'part_name': p_data['part_name'],
                            'variants': []
                        }
                    
                    # Merge variants deduplicating by hollander number
                    existing = {v['hollander_number'] for v in merged_models[m_name]['parts'][y_key][p_key]['variants']}
                    for v in p_data.get('variants', []):
                        if v['hollander_number'] not in existing:
                            merged_models[m_name]['parts'][y_key][p_key]['variants'].append(v)
                            existing.add(v['hollander_number'])
                            
        # Format the final list
        for m_name, data in merged_models.items():
            # Convert year set to sorted list
            data['years'] = sorted(list(data['year_set']), reverse=True)
            del data['year_set']
            
            # Convert parts dicts to lists
            for y_key in list(data['parts'].keys()):
                # Sort parts by name for better UX
                p_list = list(data['parts'][y_key].values())
                p_list.sort(key=lambda x: x['part_name'])
                data['parts'][y_key] = p_list
                
            result['models'].append(data)
            
        # Sort models alphabetically by name
        result['models'].sort(key=lambda x: x['model_name'])

        # --- Store in cache for 24 hours ---
        cache.set(cache_key, result, CACHE_TTL)
        
        return Response(result)
        
    except Exception as e:
        print(f"Bulk vehicle data error: {e}")
        import traceback
        traceback.print_exc()
        return Response({'error': str(e)}, status=500)
