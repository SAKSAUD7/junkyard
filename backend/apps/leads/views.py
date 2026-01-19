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
from apps.hollander.models import Vendor

@require_http_methods(["GET"])
def hollander_lookup(request):
    """
    Lookup vendors by Hollander interchange number.
    This is a placeholder for future Hollander integration.
    """
    interchange_number = request.GET.get('interchange_number', '')
    
    if not interchange_number:
        return JsonResponse({'error': 'interchange_number parameter is required'}, status=400)
    
    # Placeholder response - will be implemented when Hollander data is integrated
    return JsonResponse({
        'interchange_number': interchange_number,
        'vendors': [],
        'message': 'Hollander lookup functionality coming soon'
    })

