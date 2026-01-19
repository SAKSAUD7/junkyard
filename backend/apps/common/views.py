from rest_framework import viewsets, permissions
from apps.hollander.models import Make, Model, PartType, State
from .models import ContactMessage
from .serializers import (
    MakeSerializer, ModelSerializer, PartSerializer,
    StateSerializer, ContactMessageSerializer
)


class MakeViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for vehicle makes"""
    queryset = Make.objects.all()
    serializer_class = MakeSerializer


class ModelViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for vehicle models"""
    queryset = Model.objects.all()
    serializer_class = ModelSerializer

    def get_queryset(self):
        queryset = Model.objects.all()
        
        # Filter by makeID if provided (frontend uses camelCase)
        make_id = self.request.query_params.get('makeID', None) or self.request.query_params.get('make_id', None)
        if make_id:
            queryset = queryset.filter(make__make_id=make_id)
        
        return queryset


class PartViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for auto parts"""
    queryset = PartType.objects.all()
    serializer_class = PartSerializer


class StateViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for states"""
    queryset = State.objects.all()
    serializer_class = StateSerializer


class ContactMessageViewSet(viewsets.ModelViewSet):
    """
    API endpoint for contact messages.
    POST: Public (AllowAny)
    GET/PUT/DELETE: Admin only (IsAdminUser)
    """
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action == 'create':
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAdminUser]
        return [permission() for permission in permission_classes]
    
    from rest_framework.decorators import action
    from rest_framework import status
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Mark a message as read"""
        message = self.get_object()
        message.is_read = True
        message.save()
        return Response({'status': 'Message marked as read'})
    
    @action(detail=True, methods=['post'])
    def mark_as_unread(self, request, pk=None):
        """Mark a message as unread"""
        message = self.get_object()
        message.is_read = False
        message.save()
        return Response({'status': 'Message marked as unread'})
    
    @action(detail=False, methods=['post'])
    def bulk_delete(self, request):
        """Delete multiple messages"""
        ids = request.data.get('ids', [])
        if not ids:
            return Response({'error': 'No IDs provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        deleted_count = ContactMessage.objects.filter(id__in=ids).delete()[0]
        return Response({'status': f'{deleted_count} messages deleted'})



from rest_framework.response import Response
from rest_framework.views import APIView
from apps.leads.models import Lead
from apps.hollander.models import Vendor
from apps.ads.models import Advertisement

class AdminStatsView(APIView):
    """
    Returns statistics for the admin dashboard.
    Only accessible by admins.
    """
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        from django.db.models import Count
        from datetime import datetime, timedelta
        
        # Basic stats
        total_leads = Lead.objects.count()
        new_leads = Lead.objects.filter(status='new').count()
        active_vendors = Vendor.objects.filter(is_active=True).count()
        total_ads = Advertisement.objects.count()
        active_ads = Advertisement.objects.filter(is_active=True).count()
        unread_messages = ContactMessage.objects.filter(is_read=False).count()
        
        # Vendor distribution by state (top 10)
        vendor_distribution = Vendor.objects.filter(is_active=True).values('state').annotate(
            count=Count('id')
        ).order_by('-count')[:10]
        
        # Recent leads (last 7 days)
        seven_days_ago = datetime.now() - timedelta(days=7)
        recent_leads = Lead.objects.filter(
            created_at__gte=seven_days_ago
        ).values('created_at__date').annotate(
            count=Count('id')
        ).order_by('created_at__date')
        
        # Format recent leads for chart
        leads_trend = []
        for i in range(7):
            date = (datetime.now() - timedelta(days=6-i)).date()
            count = next((item['count'] for item in recent_leads if item['created_at__date'] == date), 0)
            leads_trend.append({
                'date': date.strftime('%Y-%m-%d'),
                'name': date.strftime('%a'),  # Mon, Tue, etc.
                'leads': count
            })
        
        # Recent activity (last 5 leads)
        recent_activity = Lead.objects.order_by('-created_at')[:5].values(
            'id', 'name', 'make', 'model', 'part', 'created_at', 'status'
        )
        
        return Response({
            "total_leads": total_leads,
            "new_leads": new_leads,
            "active_vendors": active_vendors,
            "total_vendors": Vendor.objects.count(),
            "total_ads": total_ads,
            "active_ads": active_ads,
            "unread_messages": unread_messages,
            "vendor_distribution": list(vendor_distribution),
            "leads_trend": leads_trend,
            "recent_activity": list(recent_activity)
        })



