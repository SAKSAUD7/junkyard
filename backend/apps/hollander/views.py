from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework import viewsets, filters
from rest_framework.permissions import IsAdminUser, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from .models import Make, Model, PartPricing, PartType, HollanderMakeModelRef, HollanderIndex, HollanderPartRef, Zipcode
from .serializers import PartPricingSerializer
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


@api_view(['POST'])
def hollander_lookup(request):
    """
    Lookup Hollander interchange number and options for a specific part.
    Expects: year, make, model, part_type (or their IDs)
    Returns: {results: [{hollander_number, options}]}
    
    Uses flexible matching strategy:
    1. Try exact ID match
    2. Try partial model name match
    3. Try make + part + year only (ignore model)
    """
    try:
        year = request.data.get('year')
        make_id = request.data.get('make_id')
        model_id = request.data.get('model_id')
        part_id = request.data.get('part_id')
        
        # Also accept string names as fallback
        make_name = request.data.get('make')
        model_name = request.data.get('model')
        part_name = request.data.get('part_type')
        
        if not year:
            return Response({'results': []})
        
        # Resolve IDs if names provided
        if make_name and not make_id:
            make_obj = Make.objects.filter(make_name__iexact=make_name).first()
            if make_obj:
                make_id = make_obj.make_id
                
        if model_name and not model_id:
            model_obj = Model.objects.filter(model_name__iexact=model_name).first()
            if model_obj:
                model_id = model_obj.model_id
                
        if part_name and not part_id:
            part_obj = PartType.objects.filter(part_name__iexact=part_name).first()
            if part_obj:
                part_id = part_obj.part_id
        
        if not make_id or not part_id:
            return Response({'results': []})
        
        # Convert to integers
        try:
            year = int(year)
            make_id = int(make_id)
            if model_id:
                model_id = int(model_id)
            part_id = int(part_id)
        except (ValueError, TypeError):
            return Response({'results': []})
        
        pricing_record = None
        
        # Strategy 1: Try exact match with model_id
        if model_id:
            pricing_record = PartPricing.objects.filter(
                make_ref__make_id=make_id,
                model_ref__model_id=model_id,
                part_type_ref__part_id=part_id,
                year_start__lte=year,
                year_end__gte=year
            ).first()
        
        # Strategy 2: If no exact match and we have model_name, try partial model name match
        if not pricing_record and model_name:
            # Get the model object to extract key parts of the name
            model_obj = Model.objects.filter(model_id=model_id).first() if model_id else None
            if model_obj:
                # Try to find pricing with similar model name
                pricing_record = PartPricing.objects.filter(
                    make_ref__make_id=make_id,
                    model_ref__model_name__icontains=model_obj.model_name.split()[0],  # Use first word
                    part_type_ref__part_id=part_id,
                    year_start__lte=year,
                    year_end__gte=year
                ).first()
        
        # Strategy 3: Fallback - just match make + part + year (ignore model)
        if not pricing_record:
            pricing_record = PartPricing.objects.filter(
                make_ref__make_id=make_id,
                part_type_ref__part_id=part_id,
                year_start__lte=year,
                year_end__gte=year
            ).first()
        
        if pricing_record:
            # Use the get_all_options() method to combine all option fields
            result = {
                'hollander_number': pricing_record.hollander_number or 'N/A',
                'options': pricing_record.get_all_options()
            }
            return Response({'results': [result]})
        
        # If no match found, return empty
        return Response({'results': []})
        
    except Exception as e:
        print(f"Hollander lookup error: {e}")
        import traceback
        traceback.print_exc()
        return Response({'results': []}, status=500)


@api_view(['GET'])
def zipcode_lookup(request):
    """
    Lookup city and state information by zip code.
    GET /api/zipcode/lookup/?zip=12345
    """
    zip_code = request.GET.get('zip', '').strip()
    
    if not zip_code:
        return Response({
            'error': 'Zip code is required',
            'found': False
        }, status=400)
    
    try:
        # Lookup zipcode in database
        zipcode_obj = Zipcode.objects.filter(postal_code=zip_code).first()
        
        if zipcode_obj:
            return Response({
                'found': True,
                'zip': zipcode_obj.postal_code,
                'city': zipcode_obj.city_name,
                'state': zipcode_obj.state_abbr,
                'county': zipcode_obj.county_name or ''
            })
        else:
            return Response({
                'found': False,
                'zip': zip_code,
                'message': 'Zip code not found in database'
            })
            
    except Exception as e:
        return Response({
            'error': str(e),
            'found': False
        }, status=500)


@api_view(['GET'])
def get_zipcodes_by_state(request):
    """
    Get all zipcodes for a given state.
    GET /api/zipcodes/state/?state=IL
    Returns a list of zipcodes with city names.
    """
    state_code = request.GET.get('state', '').strip().upper()
    
    if not state_code:
        return Response({
            'error': 'State code is required',
            'zipcodes': []
        }, status=400)
    
    try:
        # Get zipcodes for the state, ordered by city name
        zipcodes = Zipcode.objects.filter(
            state_abbr__iexact=state_code
        ).order_by('city_name', 'postal_code').values(
            'postal_code', 'city_name'
        )
        
        # Limit to 1000 results to avoid overwhelming the response
        zipcodes_list = list(zipcodes[:1000])
        
        return Response({
            'state': state_code,
            'count': len(zipcodes_list),
            'zipcodes': zipcodes_list
        })
        
    except Exception as e:
        return Response({
            'error': str(e),
            'zipcodes': []
        }, status=500)


class PartPricingViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Part Pricing management.
    Provides CRUD operations for part pricing data.
    """
    queryset = PartPricing.objects.all().order_by('-id')
    serializer_class = PartPricingSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    # Filtering
    filterset_fields = {
        'make': ['exact', 'icontains'],
        'model': ['exact', 'icontains'],
        'part_name': ['exact', 'icontains'],
        'year_start': ['exact', 'gte', 'lte'],
        'year_end': ['exact', 'gte', 'lte'],
    }
    
    # Search
    search_fields = ['hollander_number', 'make', 'model', 'part_name']
    
    # Ordering
    ordering_fields = ['hollander_number', 'make', 'model', 'year_start', 'new_price']
    
    # Pagination
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Additional custom filters
        hollander = self.request.query_params.get('hollander_number', None)
        if hollander:
            queryset = queryset.filter(hollander_number__icontains=hollander)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        """Export all pricing data to CSV"""
        import csv
        from django.http import HttpResponse
        
        # Get filtered queryset
        queryset = self.filter_queryset(self.get_queryset())
        
        # Create CSV response
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="part_pricing_export.csv"'
        
        writer = csv.writer(response)
        
        # Write header
        writer.writerow([
            'ID', 'Hollander Number', 'Make', 'Model', 'Part Name',
            'Year Start', 'Year End', 'New Price', 'WOW Price', 'CTS Price',
            'Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5',
            'Option 6', 'Option 7', 'Option 8', 'Option 9', 'Option 10', 'Option 11',
            'Created At', 'Updated At'
        ])
        
        # Write data rows
        for item in queryset:
            writer.writerow([
                item.id,
                item.hollander_number,
                item.make,
                item.model,
                item.part_name,
                item.year_start,
                item.year_end,
                item.new_price or '',
                item.wow_price or '',
                item.cts_price or '',
                item.option1,
                item.option2,
                item.option3,
                item.option4,
                item.option5,
                item.option6,
                item.option7,
                item.option8,
                item.option9,
                item.option10,
                item.option11,
                item.created_at.strftime('%Y-%m-%d %H:%M:%S') if item.created_at else '',
                item.updated_at.strftime('%Y-%m-%d %H:%M:%S') if item.updated_at else '',
            ])
        
        return response
