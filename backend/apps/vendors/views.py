from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Vendor
from .serializers import VendorSerializer


class VendorViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for vendors/junkyards
    Supports filtering by state, city, zipcode, and search by name
    Returns all vendors without pagination
    """
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'city', 'state']
    pagination_class = None  # Disable pagination to return all vendors

    def get_queryset(self):
        queryset = Vendor.objects.all().order_by('id')  # Order by ID
        
        # Filter for trusted vendors
        trusted = self.request.query_params.get('trusted', None)
        if trusted and trusted.lower() == 'true':
            queryset = queryset.filter(is_trusted=True).order_by('-trust_level', 'id')
        
        # Filter by state
        state = self.request.query_params.get('state', None)
        if state:
            queryset = queryset.filter(state__iexact=state)
        
        # Filter by city
        city = self.request.query_params.get('city', None)
        if city:
            queryset = queryset.filter(city__iexact=city)
        
        # Filter by zipcode (matches first 3 digits)
        zipcode = self.request.query_params.get('zipcode', None)
        if zipcode:
            # Match first 3 digits for area-based search
            queryset = queryset.filter(zipcode__startswith=zipcode[:3])
        
        # Search by name
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(city__icontains=search) |
                Q(state__icontains=search)
            )
        
        return queryset
