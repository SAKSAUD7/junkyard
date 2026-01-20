import csv
from django.http import HttpResponse
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, permissions
from .models import Lead
from .serializers import LeadSerializer


class LeadViewSet(viewsets.ModelViewSet):
    """
    API endpoint for leads management.
    Admin only access.
    """
    queryset = Lead.objects.all().order_by('-created_at')
    serializer_class = LeadSerializer
    permission_classes = [permissions.IsAdminUser]
    
    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        """
        Export leads to CSV file.
        Supports filtering by status via query params.
        """
        # Get filtered queryset
        queryset = self.get_queryset()
        
        # Apply status filter if provided
        status = request.query_params.get('status')
        if status and status != 'all':
            queryset = queryset.filter(status=status)
        
        # Apply search filter if provided
        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                name__icontains=search
            ) | queryset.filter(
                email__icontains=search
            ) | queryset.filter(
                make__icontains=search
            )
        
        # Create CSV response
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="leads_export.csv"'
        
        writer = csv.writer(response)
        
        # Write header
        writer.writerow([
            'ID',
            'Date Created',
            'Status',
            'Customer Name',
            'Email',
            'Phone',
            'Zipcode',
            'Year',
            'Make',
            'Model',
            'VIN',
            'Part Needed',
            'Condition',
            'Notes'
        ])
        
        # Write data rows
        for lead in queryset:
            writer.writerow([
                lead.id,
                lead.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                lead.status or 'new',
                lead.name,
                lead.email,
                lead.phone,
                lead.zipcode or '',
                lead.year,
                lead.make,
                lead.model,
                lead.vin or '',
                lead.part,
                lead.condition or '',
                lead.notes or ''
            ])
        
        return response


from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from apps.hollander.models import HollanderInterchange

@csrf_exempt
@require_http_methods(["GET", "POST"])
def hollander_lookup(request):
    """
    Lookup Hollander interchange number based on vehicle details.
    Queries the HollanderInterchange table for matching records.
    Accepts: year, make, model, part_type (and their IDs)
    """
    # Handle both GET and POST requests
    if request.method == 'POST':
        import json
        try:
            data = json.loads(request.body)
            year = data.get('year', '')
            make = data.get('make', '')
            model = data.get('model', '')
            part_type = data.get('part_type', '')
        except:
            year = make = model = part_type = ''
    else:
        year = request.GET.get('year', '')
        make = request.GET.get('make', '')
        model = request.GET.get('model', '')
        part_type = request.GET.get('part_type', '')
    
    # Query the Hollander database
    try:
        year_int = int(year) if year else 0
        
        # Build query - match year range, make, model, and part type
        queryset = HollanderInterchange.objects.filter(
            year_start__lte=year_int,
            year_end__gte=year_int,
            make__iexact=make,
            model__iexact=model,
            part_type__iexact=part_type
        )
        
        # Get first matching result
        result = queryset.first()
        
        if result:
            return JsonResponse({
                'results': [{
                    'hollander_number': result.hollander_number,
                    'options': result.options or '',
                    'year_start': result.year_start,
                    'year_end': result.year_end,
                    'make': result.make,
                    'model': result.model,
                    'part_type': result.part_type,
                    'notes': result.notes or ''
                }]
            })
        else:
            # No match found
            return JsonResponse({
                'results': [],
                'message': f'No Hollander number found for {year} {make} {model} - {part_type}'
            })
            
    except Exception as e:
        # Error during lookup
        return JsonResponse({
            'results': [],
            'error': str(e),
            'message': 'Error looking up Hollander number'
        })

