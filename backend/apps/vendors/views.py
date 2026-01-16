from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from apps.hollander.models import Vendor
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
            queryset = queryset.filter(is_active=True).order_by('id')

        # Filter for featured vendors
        featured = self.request.query_params.get('featured', None)
        if featured and featured.lower() == 'true':
            queryset = queryset.filter(is_featured=True)

        # Filter for top rated vendors
        top_rated = self.request.query_params.get('top_rated', None)
        if top_rated and top_rated.lower() == 'true':
            queryset = queryset.filter(is_top_rated=True)

        # Filter by state
        state = self.request.query_params.get('state', None)
        if state:
            queryset = queryset.filter(state__iexact=state)
        
        # Filter by city
        city = self.request.query_params.get('city', None)
        if city:
            queryset = queryset.filter(city__iexact=city)
        
        # Filter by zipcode (matches first 3 digits) - use zip_code field
        zipcode = self.request.query_params.get('zipcode', None)
        if zipcode:
            # Match first 3 digits for area-based search
            queryset = queryset.filter(zip_code__startswith=zipcode[:3])
        
        # Search by name
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(city__icontains=search) |
                Q(state__icontains=search)
            )
        
        return queryset

    @action(detail=False, methods=['get'])
    def suggest_zipcodes(self, request):
        """
        Return a list of detailed location info for autocomplete.
        Returns format: {
            "zipcode": "12345",
            "city": "City Name", 
            "state": "ST",
            "display": "12345 - City Name, ST"
        }
        """
        prefix = request.query_params.get('prefix', '')
        if not prefix or len(prefix) < 2:
            return Response([])
        
        # Get vendors with zipcodes starting with prefix
        # We need distinct locations, so we group by zip_code, city, state
        matches = Vendor.objects.filter(
            zip_code__startswith=prefix
        ).values('zip_code', 'city', 'state').distinct().order_by('zip_code')[:10]
        
        results = []
        for m in matches:
            results.append({
                "zipcode": m['zip_code'],
                "city": m['city'],
                "state": m['state'],
                "display": f"{m['zip_code']} - {m['city']}, {m['state']}"
            })
            
        return Response(results)
