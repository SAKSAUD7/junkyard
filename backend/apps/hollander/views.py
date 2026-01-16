from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Make, Model, PartPricing, PartType, HollanderMakeModelRef, HollanderIndex, HollanderPartRef, Zipcode
from django.db.models import Q, Min, Max

# ==========================================
# UNIFIED CONNECTIVITY LOGIC HELPER
# ==========================================
def query_catalog_index(make_id, model_id, year=None):
    """
    Central Logic for querying the Hollander Catalog.
    Guarantees that Makes/Models link to valid Years and Parts.
    """
    valid_years = set()
    valid_part_codes = set()
    
    # 1. Resolve Model Reference (Make/Model -> Hollander Ref)
    if not model_id:
        return valid_years, valid_part_codes
    
    # Ensure model_id is used correctly (String or Int handling)
    # Model.model_id is an IntegerField.
    
    model_obj = Model.objects.filter(model_id=model_id).first()
    if not model_obj:
        return valid_years, valid_part_codes
    
    # Multi-Key Probe (ID, Name, RefName)
    keys_to_try = []
    # Key A: Exact Model Name (e.g. "ACCORD")
    keys_to_try.append(model_obj.model_name)
    
    # Key B: Reference Name/ID
    ref = HollanderMakeModelRef.objects.filter(h_model__iexact=model_obj.model_name).first()
    if not ref:
        ref = HollanderMakeModelRef.objects.filter(h_model__icontains=model_obj.model_name).first()
    
    if ref:
        keys_to_try.append(str(ref.ref_id))
        keys_to_try.append(ref.h_model)

    # 2. Query Index (HollanderIndex)
    # Filter by keys
    for key in keys_to_try:
        query = HollanderIndex.objects.filter(model_nm__iexact=key.strip())
        
        # If specific year requested (for checking Parts), filter by it
        if year:
            query = query.filter(begin_year__lte=year, end_year__gte=year)
            
        # Optimization: Values List
        # Get Years
        if not year:
            ranges = query.values_list('begin_year', 'end_year')
            for start, end in ranges:
                if start and end: 
                    # Sanity
                    s, e = max(1950, start), min(2030, end)
                    if s <= e:
                        valid_years.update(range(s, e + 1))
        
        # Get Parts Codes (if we have a year connection OR just browsing)
        codes = query.values_list('part_type_nbr', flat=True).distinct()
        valid_part_codes.update(codes)

    return valid_years, valid_part_codes

# ==========================================
# API VIEWS
# ==========================================

@api_view(['GET'])
def get_makes(request):
    """
    Return ALL Makes.
    Source: Make Reference Table
    """
    makes = Make.objects.all().order_by('make_name')
    data = [{'makeID': m.make_id, 'makeName': m.make_name} for m in makes]
    return Response(data)

@api_view(['GET'])
def get_models(request):
    """
    Return Models for Make.
    Source: Model Reference Table (Dependent on Make)
    """
    make_id = request.query_params.get('make_id') or request.query_params.get('makeID')
    
    if not make_id:
        return Response([])

    # Robust Name Resolution
    if str(make_id) and not str(make_id).isdigit():
         m = Make.objects.filter(make_name__iexact=str(make_id)).first()
         if m: make_id = m.make_id

    if str(make_id).isdigit():
        models = Model.objects.filter(make__make_id=make_id)
    else:
        models = Model.objects.filter(make__make_name__iexact=make_id)
        
    models = models.order_by('model_name')
    data = [{'modelID': m.model_id, 'modelName': m.model_name} for m in models]
    return Response(data)

@api_view(['GET'])
def get_years(request):
    """
    Return Years.
    Priority:
    1. Inventory (PartPricing) - accurate for what we HAVE.
    2. Catalog (HollanderIndex) - accurate for what EXISTS.
       Uses robust multi-key lookup.
    """
    make_id = request.query_params.get('make_id') or request.query_params.get('makeID')
    model_id = request.query_params.get('model_id') or request.query_params.get('modelID')
    
    if not make_id or not model_id:
        return Response([])

    # Robustness: Resolve Name to ID if needed
    try:
        if str(make_id) and not str(make_id).isdigit():
            m = Make.objects.filter(make_name__iexact=str(make_id)).first()
            if m: make_id = m.make_id
            
        if str(model_id) and not str(model_id).isdigit():
            m = Model.objects.filter(model_name__iexact=str(model_id)).first()
            if m: model_id = m.model_id
            
        # Ensure Int
        make_id = int(make_id)
        model_id = int(model_id)
    except Exception as e:
        print(f"Error parsing IDs in get_years: {e}")
        return Response([])

    years = set()
    
    # Source 1: Inventory (Data Connection: PartPricing)
    try:
        inv_ranges = PartPricing.objects.filter(
            make_ref__make_id=make_id,
            model_ref__model_id=model_id
        ).values_list('year_start', 'year_end')
        
        for start, end in inv_ranges:
            if start and end: 
                s, e = int(start), int(end)
                if s > 1900 and e < 2030:
                    years.update(range(s, e + 1))
    except Exception as e:
        print(f"Inventory lookup error: {e}")

    # Source 2: Catalog (Data Connection: HollanderIndex via Unified Helper)
    try:
        cat_years, _ = query_catalog_index(make_id, model_id)
        years.update(cat_years)
    except Exception as e:
        print(f"Catalog lookup main execution error: {e}")
    
    sorted_years = sorted(list(years), reverse=True)
    return Response(sorted_years)


@api_view(['GET'])
def get_parts(request):
    """
    Return Parts dependent on Make/Model/Year.
    Shows "Real Data" (Catalog Matches + Inventory Matches).
    """
    year = request.query_params.get('year')
    make_id = request.query_params.get('make_id') or request.query_params.get('makeID')
    model_id = request.query_params.get('model_id') or request.query_params.get('modelID')

    if not year or not make_id or not model_id:
        # Fallback to full list if incomplete
        parts = PartType.objects.all().order_by('part_name')
        data = [{'partID': p.part_id, 'partName': p.part_name} for p in parts]
        return Response(data)
        
    # Robustness: Resolve Name to ID
    try:
        if str(make_id) and not str(make_id).isdigit():
            m = Make.objects.filter(make_name__iexact=str(make_id)).first()
            if m: make_id = m.make_id

        if str(model_id) and not str(model_id).isdigit():
            m = Model.objects.filter(model_name__iexact=str(model_id)).first()
            if m: model_id = m.model_id
            
        make_id = int(make_id)
        model_id = int(model_id)
    except Exception as e:
         print(f"Error parsing IDs in get_parts: {e}")
         # Return all parts on error to be safe? Or empty?
         # Fallback to all parts so user isn't blocked
         parts = PartType.objects.all().order_by('part_name')
         data = [{'partID': p.part_id, 'partName': p.part_name} for p in parts]
         return Response(data)

    valid_part_names = set()

    # Source 1: Inventory (Data Connection: PartPricing)
    inv_parts = PartPricing.objects.filter(
        make_ref__make_id=make_id,
        model_ref__model_id=model_id,
        year_start__lte=year,
        year_end__gte=year,
        part_type_ref__isnull=False
    ).values_list('part_type_ref__part_name', flat=True).distinct()
    
    valid_part_names.update(inv_parts)

    # Source 2: Catalog (Data Connection: HollanderIndex via Unified Helper)
    _, valid_codes = query_catalog_index(make_id, model_id, year=year)
    
    if valid_codes:
        # Data Connection: HollanderPartRef (Code -> Name)
        cat_names = HollanderPartRef.objects.filter(
            part_code__in=valid_codes
        ).values_list('part_name', flat=True)
        
        # Fuzzy Map to PartType (Data Connection: PartType)
        all_parts_dict = {p.part_name.lower(): p.part_name for p in PartType.objects.all()}
        
        for c_name in cat_names:
            c_lower = c_name.lower()
            if c_lower in all_parts_dict:
                valid_part_names.add(all_parts_dict[c_lower])
                continue
                
            for p_lower, p_real in all_parts_dict.items():
                if p_lower in c_lower and len(p_lower) > 3:
                     valid_part_names.add(p_real)
        
    # Final Filter
    if valid_part_names:
        parts = PartType.objects.filter(part_name__in=valid_part_names).order_by('part_name')
    else:
        # If no parts found specifically, return all to prevent "Empty Options"
        parts = PartType.objects.all().order_by('part_name')

    data = [{'partID': p.part_id, 'partName': p.part_name} for p in parts]
    return Response(data)


@api_view(['GET'])
def search_pincodes(request):
    """
    Search for pincodes and return matching results with exact state.
    Query parameter: q (search query)
    Returns: List of {postal_code, city_name, state_abbr}
    """
    query = request.query_params.get('q', '').strip()
    
    if not query or len(query) < 1:
        return Response([])
    
    # Search for pincodes that start with the query (exact match, no substring replication)
    zipcodes = Zipcode.objects.filter(
        postal_code__startswith=query
    ).values('postal_code', 'city_name', 'state_abbr').distinct()[:10]
    
    return Response(list(zipcodes))
