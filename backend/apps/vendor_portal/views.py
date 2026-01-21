from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta
from itertools import chain

from apps.hollander.models import Vendor
from apps.leads.models import Lead, VendorLead
from apps.users.models import VendorProfile
from .models import VendorInventory, VendorNotification, VendorBusinessHours
from .serializers import (
    VendorDashboardSerializer,
    VendorProfileUpdateSerializer,
    VendorInventorySerializer,
    VendorLeadSerializer,
    VendorLeadForPortalSerializer,
    LeadStatusUpdateSerializer,
    VendorNotificationSerializer,
    VendorBusinessHoursSerializer
)
from .permissions import IsVendorUser, IsVendorOwner, CanManageInventory


class VendorDashboardView(APIView):
    """
    GET: Dashboard overview with stats and recent leads
    """
    permission_classes = [IsAuthenticated, IsVendorUser, IsVendorOwner]
    
    def get(self, request):
        try:
            vendor = request.user.vendor_profile.vendor
        except:
            return Response({
                'error': 'No vendor profile found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Get lead statistics - filtered by vendor assignment
        vendor_leads = Lead.objects.filter(assigned_vendors=vendor)
        
        # Get vendor leads matching vendor's state
        state_vendor_leads = VendorLead.objects.filter(state__iexact=vendor.state)
        
        # Combine counts
        total_leads = vendor_leads.count() + state_vendor_leads.count()
        new_leads = vendor_leads.filter(status='new').count() + state_vendor_leads.filter(status='new').count()
        contacted_leads = vendor_leads.filter(status='contacted').count() + state_vendor_leads.filter(status='contacted').count()
        converted_leads = vendor_leads.filter(status='converted').count() + state_vendor_leads.filter(status='converted').count()
        closed_leads = vendor_leads.filter(status='closed').count() + state_vendor_leads.filter(status='closed').count()
        
        # Get recent leads from both sources
        recent_regular = list(vendor_leads.order_by('-created_at')[:3])
        recent_vendor = list(state_vendor_leads.order_by('-created_at')[:3])
        recent_combined = sorted(
            recent_regular + recent_vendor,
            key=lambda x: x.created_at,
            reverse=True
        )[:5]
        
        dashboard_data = {
            'total_leads': total_leads,
            'new_leads': new_leads,
            'contacted_leads': contacted_leads,
            'converted_leads': converted_leads,
            'closed_leads': closed_leads,
            'recent_leads': recent_combined,
            'account_status': 'Active' if getattr(vendor, 'is_active', True) else 'Inactive',
            'unread_notifications': VendorNotification.objects.filter(
                vendor=vendor, 
                is_read=False
            ).count()
        }
        
        serializer = VendorDashboardSerializer(dashboard_data)
        return Response(serializer.data)


class VendorProfileView(generics.RetrieveUpdateAPIView):
    """
    GET: Get vendor profile
    PUT/PATCH: Update vendor profile
    """
    permission_classes = [IsAuthenticated, IsVendorUser, IsVendorOwner]
    serializer_class = VendorProfileUpdateSerializer
    
    def get_object(self):
        try:
            return self.request.user.vendor_profile.vendor
        except:
            return None
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance is None:
            return Response({
                'error': 'No vendor profile found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class VendorBusinessHoursView(APIView):
    """
    GET: Get business hours
    POST: Update business hours
    """
    permission_classes = [IsAuthenticated, IsVendorUser, IsVendorOwner]
    
    def get(self, request):
        try:
            vendor = request.user.vendor_profile.vendor
            hours = VendorBusinessHours.objects.filter(vendor=vendor)
            serializer = VendorBusinessHoursSerializer(hours, many=True)
            return Response(serializer.data)
        except:
            return Response({
                'error': 'No vendor profile found'
            }, status=status.HTTP_404_NOT_FOUND)
    
    def post(self, request):
        """Bulk update business hours"""
        try:
            vendor = request.user.vendor_profile.vendor
            hours_data = request.data.get('hours', [])
            
            # Delete existing hours
            VendorBusinessHours.objects.filter(vendor=vendor).delete()
            
            # Create new hours
            created_hours = []
            for hour_data in hours_data:
                hour_data['vendor'] = vendor.id
                serializer = VendorBusinessHoursSerializer(data=hour_data)
                if serializer.is_valid():
                    hour = VendorBusinessHours.objects.create(
                        vendor=vendor,
                        **serializer.validated_data
                    )
                    created_hours.append(hour)
            
            return Response(
                VendorBusinessHoursSerializer(created_hours, many=True).data,
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class VendorInventoryListView(generics.ListCreateAPIView):
    """
    GET: List all inventory items for vendor
    POST: Create new inventory item
    """
    permission_classes = [IsAuthenticated, IsVendorUser, IsVendorOwner, CanManageInventory]
    serializer_class = VendorInventorySerializer
    
    def get_queryset(self):
        try:
            vendor = self.request.user.vendor_profile.vendor
            return VendorInventory.objects.filter(vendor=vendor)
        except:
            return VendorInventory.objects.none()
    
    def perform_create(self, serializer):
        try:
            vendor = self.request.user.vendor_profile.vendor
            serializer.save(vendor=vendor)
        except:
            raise Exception("No vendor profile found")


class VendorInventoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET: Get inventory item detail
    PUT/PATCH: Update inventory item
    DELETE: Delete inventory item
    """
    permission_classes = [IsAuthenticated, IsVendorUser, IsVendorOwner, CanManageInventory]
    serializer_class = VendorInventorySerializer
    
    def get_queryset(self):
        try:
            vendor = self.request.user.vendor_profile.vendor
            return VendorInventory.objects.filter(vendor=vendor)
        except:
            return VendorInventory.objects.none()


class VendorLeadListView(APIView):
    """
    GET: List all leads for vendor (both regular leads and vendor leads)
    """
    permission_classes = [IsAuthenticated, IsVendorUser, IsVendorOwner]
    
    def get(self, request):
        try:
            vendor = request.user.vendor_profile.vendor
            
            # Get regular leads assigned to vendor
            regular_leads = Lead.objects.filter(assigned_vendors=vendor)
            
            # Get vendor leads matching vendor's state
            vendor_leads = VendorLead.objects.filter(
                state__iexact=vendor.state
            )
            
            # Apply status filter if provided
            status_filter = request.query_params.get('status', None)
            if status_filter:
                regular_leads = regular_leads.filter(status=status_filter)
                vendor_leads = vendor_leads.filter(status=status_filter)
            
            # Apply search filter if provided
            search = request.query_params.get('search', None)
            if search:
                regular_leads = regular_leads.filter(
                    Q(name__icontains=search) |
                    Q(email__icontains=search) |
                    Q(make__icontains=search) |
                    Q(model__icontains=search) |
                    Q(part__icontains=search)
                )
                vendor_leads = vendor_leads.filter(
                    Q(name__icontains=search) |
                    Q(email__icontains=search) |
                    Q(make__icontains=search) |
                    Q(model__icontains=search)
                )
            
            # Serialize both types
            regular_leads_data = VendorLeadSerializer(
                regular_leads.order_by('-created_at'), 
                many=True
            ).data
            
            vendor_leads_data = VendorLeadForPortalSerializer(
                vendor_leads.order_by('-created_at'), 
                many=True
            ).data
            
            # Combine and sort by created_at
            combined_leads = list(regular_leads_data) + list(vendor_leads_data)
            combined_leads.sort(key=lambda x: x['created_at'], reverse=True)
            
            return Response({
                'results': combined_leads,
                'count': len(combined_leads)
            })
            
        except Exception as e:
            return Response({
                'error': str(e),
                'results': [],
                'count': 0
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VendorLeadDetailView(generics.RetrieveUpdateAPIView):
    """
    GET: Get lead detail
    PUT/PATCH: Update lead status
    """
    permission_classes = [IsAuthenticated, IsVendorUser, IsVendorOwner]
    serializer_class = VendorLeadSerializer
    queryset = Lead.objects.all()
    
    def update(self, request, *args, **kwargs):
        """Only allow status updates"""
        lead = self.get_object()
        status_serializer = LeadStatusUpdateSerializer(data=request.data)
        
        if status_serializer.is_valid():
            lead.status = status_serializer.validated_data['status']
            lead.save()
            
            return Response(
                VendorLeadSerializer(lead).data,
                status=status.HTTP_200_OK
            )
        
        return Response(
            status_serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class VendorNotificationListView(generics.ListAPIView):
    """
    GET: List vendor notifications
    """
    permission_classes = [IsAuthenticated, IsVendorUser, IsVendorOwner]
    serializer_class = VendorNotificationSerializer
    
    def get_queryset(self):
        try:
            vendor = self.request.user.vendor_profile.vendor
            return VendorNotification.objects.filter(vendor=vendor)
        except:
            return VendorNotification.objects.none()


class VendorNotificationMarkReadView(APIView):
    """
    POST: Mark notification as read
    """
    permission_classes = [IsAuthenticated, IsVendorUser, IsVendorOwner]
    
    def post(self, request, pk):
        try:
            vendor = request.user.vendor_profile.vendor
            notification = VendorNotification.objects.get(pk=pk, vendor=vendor)
            
            notification.is_read = True
            notification.read_at = timezone.now()
            notification.save()
            
            return Response(
                VendorNotificationSerializer(notification).data,
                status=status.HTTP_200_OK
            )
        except VendorNotification.DoesNotExist:
            return Response({
                'error': 'Notification not found'
            }, status=status.HTTP_404_NOT_FOUND)


class VendorStatsView(APIView):
    """
    GET: Detailed analytics and statistics
    """
    permission_classes = [IsAuthenticated, IsVendorUser, IsVendorOwner]
    
    def get(self, request):
        try:
            vendor = request.user.vendor_profile.vendor
        except:
            return Response({
                'error': 'No vendor profile found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Calculate various statistics - filtered by vendor assignment
        vendor_leads = Lead.objects.filter(assigned_vendors=vendor)
        
        # Leads by status
        leads_by_status = {
            'new': vendor_leads.filter(status='new').count(),
            'contacted': vendor_leads.filter(status='contacted').count(),
            'converted': vendor_leads.filter(status='converted').count(),
            'closed': vendor_leads.filter(status='closed').count(),
        }
        
        # Leads by time period
        now = timezone.now()
        leads_this_week = vendor_leads.filter(
            created_at__gte=now - timedelta(days=7)
        ).count()
        leads_this_month = vendor_leads.filter(
            created_at__gte=now - timedelta(days=30)
        ).count()
        
        # Top requested parts
        top_parts = vendor_leads.values('part').annotate(
            count=Count('part')
        ).order_by('-count')[:5]
        
        stats = {
            'leads_by_status': leads_by_status,
            'leads_this_week': leads_this_week,
            'leads_this_month': leads_this_month,
            'total_leads': vendor_leads.count(),
            'top_parts': list(top_parts),
            'inventory_count': VendorInventory.objects.filter(vendor=vendor).count(),
            'active_inventory': VendorInventory.objects.filter(
                vendor=vendor, 
                is_available=True
            ).count(),
        }
        
        return Response(stats)
