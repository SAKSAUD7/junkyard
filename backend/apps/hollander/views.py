from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Make, Model, PartType

@api_view(['GET'])
def get_makes(request):
    """Return all makes for dropdown (Only those with Data)"""
    # Strict Filter: Only show makes that have Year Ranges (Data Present)
    makes = Make.objects.filter(year_ranges__isnull=False).distinct().order_by('make_name')
    data = [{'makeID': m.make_id, 'makeName': m.make_name} for m in makes]
    return Response(data)

@api_view(['GET'])
def get_models(request):
    """Return models for a specific make (Only those with Data)"""
    make_id = request.query_params.get('make_id')
    if make_id:
        # Strict Filter: Only show models that have Year Ranges
        models = Model.objects.filter(
            make__make_id=make_id,
            year_ranges__isnull=False
        ).distinct().order_by('model_name')
    else:
        models = Model.objects.none()
    
    data = [{'modelID': m.model_id, 'modelName': m.model_name} for m in models]
    return Response(data)

@api_view(['GET'])
def get_parts(request):
    """Return all part types"""
    parts = PartType.objects.all().order_by('part_name')
    data = [{'partID': p.part_id, 'partName': p.part_name} for p in parts]
    return Response(data)

@api_view(['GET'])
def get_years(request):
    """
    Return distinct sorted years for a specific Make and Model
    """
    from .models import YearRange
    
    make_id = request.query_params.get('make_id')
    
    # Handle model_id (ID) or model name if passed
    model_id = request.query_params.get('model_id')
    # Use model name as fallback if needed, but ID is preferred
    
    if not make_id or not model_id:
        return Response([])

    # Query Year Ranges
    ranges = YearRange.objects.filter(
        make__make_id=make_id,
        model__model_id=model_id
    )
    
    years = set()
    for r in ranges:
        # Create range inclusive of end year
        # Handling potential bad data where start > end
        start = min(r.year_start, r.year_end)
        end = max(r.year_start, r.year_end)
        
        # Constraint: valid automotive years (e.g. 1900-2030)
        # to avoid data errors creating massive ranges
        if start > 1900 and end < 2030:
            for y in range(start, end + 1):
                years.add(y)
            
    # Also optionally check HollanderInterchange if YearRange is empty?
    # No, YearRange serves this purpose.
    
    sorted_years = sorted(list(years), reverse=True)
    return Response(sorted_years)
