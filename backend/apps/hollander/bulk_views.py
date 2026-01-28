"""
Bulk Vehicle Data API Endpoint
Returns complete hierarchical data for a make in a single request
Eliminates sequential API calls and loading delays
"""
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Q
from .models import Make, Model, PartPricing, PartType, HollanderIndex
from .views import query_catalog_index


@api_view(['GET'])
def get_vehicle_data_bulk(request, make_id):
    """
    Return complete hierarchical data for a make:
    Make → Models → Years → Parts → Hollander/Options
    
    This eliminates 4+ API calls by returning everything at once.
    Client-side filtering handles all dropdown interactions.
    
    Response format:
    {
        "make_id": 5,
        "make_name": "BMW",
        "models": [
            {
                "model_id": 42,
                "model_name": "318is",
                "years": [2020, 2019, ...],
                "parts": {
                    "2020": [
                        {
                            "part_id": 10,
                            "part_name": "Alternator",
                            "hollander_number": "601-00181",
                            "options": "62 Amp"
                        }
                    ]
                }
            }
        ]
    }
    """
    try:
        make_id = int(make_id)
        make = Make.objects.filter(make_id=make_id).first()
        
        if not make:
            return Response({'error': 'Make not found'}, status=404)
        
        # Get all models for this make
        models = Model.objects.filter(make=make).order_by('model_name')
        
        result = {
            'make_id': make.make_id,
            'make_name': make.make_name,
            'models': []
        }
        
        for model in models:
            model_data = {
                'model_id': model.model_id,
                'model_name': model.model_name,
                'years': [],
                'parts': {}
            }
            
            # Get years for this model (from both sources)
            years = set()
            
            # Source 1: Inventory (PartPricing)
            try:
                inv_ranges = PartPricing.objects.filter(
                    make_ref=make,
                    model_ref=model
                ).values_list('year_start', 'year_end')
                
                for start, end in inv_ranges:
                    if start and end:
                        s, e = max(1950, start), min(2030, end)
                        if s <= e:
                            years.update(range(s, e + 1))
            except Exception as e:
                print(f"Inventory years error for model {model.model_id}: {e}")
            
            # Source 2: Catalog (HollanderIndex) with fallback
            try:
                cat_years, _ = query_catalog_index(make_id, model.model_id)
                years.update(cat_years)
            except Exception as e:
                print(f"Catalog years error for model {model.model_id}: {e}")
            
            # Fallback: Extract numeric part of model name for partial matching
            if not years:
                try:
                    base_model = ''.join(filter(str.isdigit, model.model_name))
                    if base_model:
                        hollander_entries = HollanderIndex.objects.filter(
                            model_nm__icontains=base_model
                        ).values_list('begin_year', 'end_year')
                        
                        for start, end in hollander_entries:
                            if start and end:
                                s, e = max(1950, start), min(2030, end)
                                if s <= e:
                                    years.update(range(s, e + 1))
                except Exception as e:
                    print(f"Fallback years error for model {model.model_id}: {e}")
            
            model_data['years'] = sorted(list(years), reverse=True)
            
            # Get parts for each year (limit to prevent huge payloads)
            for year in model_data['years'][:20]:  # Limit to recent 20 years
                parts_set = {}  # Use dict to deduplicate by part_id
                
                # Get parts from inventory
                try:
                    pricing_records = PartPricing.objects.filter(
                        make_ref=make,
                        model_ref=model,
                        year_start__lte=year,
                        year_end__gte=year,
                        part_type_ref__isnull=False
                    ).select_related('part_type_ref')[:50]  # Limit to 50 parts per year
                    
                    for record in pricing_records:
                        part_id = record.part_type_ref.part_id
                        if part_id not in parts_set:
                            parts_set[part_id] = {
                                'part_id': part_id,
                                'part_name': record.part_type_ref.part_name,
                                'hollander_number': record.hollander_number or '',
                                'options': record.get_all_options() if hasattr(record, 'get_all_options') else ''
                            }
                except Exception as e:
                    print(f"Parts error for model {model.model_id}, year {year}: {e}")
                
                if parts_set:
                    model_data['parts'][str(year)] = list(parts_set.values())
            
            result['models'].append(model_data)
        
        return Response(result)
        
    except Exception as e:
        print(f"Bulk vehicle data error: {e}")
        import traceback
        traceback.print_exc()
        return Response({'error': str(e)}, status=500)
