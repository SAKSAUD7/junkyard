from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from apps.hollander.models import Vendor
from .serializers import VendorSerializer
from rest_framework.pagination import PageNumberPagination
from django.db.models import Count

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 24
    page_size_query_param = 'page_size'
    max_page_size = 100


class VendorViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for vendors/junkyards
    Supports filtering by state, city, zipcode, and search by name
    Returns all vendors without pagination
    """
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer
    # Allow read-only for public, admin for others. 
    # But wait, this is ReadOnlyModelViewSet. We might need a separate Admin ViewSet or override permissions.
    # The existing ViewSet is for public consumption (browsing vendors).
    # I should create a separate AdminVendorViewSet or use conditional permissions.
    # Let's keep this as public and make a new Admin one or use conditional permissions.
    # For now, let's assume the public one is fine and I'll make a new one for Admin management if needed.
    # Actually, the user wants me to BUILD everything. 
    # Let's add an AdminVendorViewSet for full management in the same file.
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'city', 'state']
    pagination_class = StandardResultsSetPagination

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

    @action(detail=False, methods=['get'])
    def state_counts(self, request):
        """
        Return the count of vendors per state.
        This provides efficient data for the Browse by State page without fetching all records.
        """
        counts = Vendor.objects.values('state').annotate(
            vendor_count=Count('id')
        ).order_by('state')
        
        # Transform into a dictionary or list format easy for frontend
        # Let's return a object { "CA": 150, "NY": 120, ... }
        data = {item['state']: item['vendor_count'] for item in counts if item['state']}
        return Response(data)

from rest_framework import permissions

from django_filters.rest_framework import DjangoFilterBackend
from django.http import HttpResponse
import csv

class AdminVendorViewSet(viewsets.ModelViewSet):
    """
    Admin ViewSet for full vendor management.
    """
    queryset = Vendor.objects.all().order_by('id')
    serializer_class = VendorSerializer
    permission_classes = [permissions.IsAdminUser]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['name', 'city', 'state', 'email']
    filterset_fields = ['is_active', 'state']
    
    def update(self, request, *args, **kwargs):
        """
        Override update to create user account when vendor is activated.
        """
        from django.contrib.auth import get_user_model
        import secrets
        
        User = get_user_model()
        vendor = self.get_object()
        was_active = vendor.is_active
        
        # Perform the update
        response = super().update(request, *args, **kwargs)
        
        # Refresh vendor from DB to get updated data
        vendor.refresh_from_db()
        
        # If vendor was just activated and doesn't have a user account
        if not was_active and vendor.is_active and vendor.email:
            # Check if user already exists
            existing_user = User.objects.filter(email=vendor.email).first()
            
            if not existing_user:
                # Generate username from email
                username = vendor.email.split('@')[0]
                base_username = username
                counter = 1
                
                # Ensure unique username
                while User.objects.filter(username=username).exists():
                    username = f"{base_username}{counter}"
                    counter += 1
                
                # Generate random password
                temp_password = secrets.token_urlsafe(12)
                
                # Create user account
                user = User.objects.create_user(
                    username=username,
                    email=vendor.email,
                    password=temp_password,
                    is_vendor=True,
                    is_active=True
                )
                
                # TODO: Send email with credentials
                # For now, log the credentials (in production, send email)
                print(f"Vendor activated: {vendor.name}")
                print(f"Username: {username}")
                print(f"Temporary Password: {temp_password}")
                print(f"Email: {vendor.email}")
                
                # Add success message to response
                response.data['message'] = f'Vendor activated! User account created with username: {username}'
                response.data['credentials'] = {
                    'username': username,
                    'temp_password': temp_password,
                    'email': vendor.email
                }
            else:
                user = existing_user
                print(f"User already exists for {vendor.email}")

            # Ensure VendorProfile exists (if user doesn't already have one)
            from apps.users.models import VendorProfile
            if not hasattr(user, 'vendor_profile'):
                VendorProfile.objects.create(
                    user=user,
                    vendor=vendor,
                    is_owner=True,
                    can_edit=True,
                    can_respond_reviews=True,
                    can_manage_inventory=True
                )
                print(f"VendorProfile created for user {user.username} and vendor {vendor.name}")
            else:
                print(f"User {user.username} already has a vendor profile")
        
        return response
    
    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        """
        Export vendors to CSV file.
        Supports filtering by is_active and state via query params.
        """
        # Get filtered queryset
        queryset = self.get_queryset()
        
        # Apply filters from query params
        is_active = request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        state_filter = request.query_params.get('state')
        if state_filter:
            queryset = queryset.filter(state=state_filter)
        
        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                name__icontains=search
            ) | queryset.filter(
                email__icontains=search
            ) | queryset.filter(
                city__icontains=search
            )
        
        # Create CSV response
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="vendors_export.csv"'
        
        writer = csv.writer(response)
        
        # Write header
        writer.writerow([
            'ID',
            'Vendor Name',
            'Email',
            'Phone',
            'Address',
            'City',
            'State',
            'Zip Code',
            'Status',
            'Featured',
            'Top Rated',
            'Created Date'
        ])
        
        # Write data rows
        for vendor in queryset:
            writer.writerow([
                vendor.id,
                vendor.name,
                vendor.email or '',
                vendor.phone or '',
                vendor.address or '',
                vendor.city,
                vendor.state,
                vendor.zip_code,
                'Active' if vendor.is_active else 'Inactive',
                'Yes' if vendor.is_featured else 'No',
                'Yes' if vendor.is_top_rated else 'No',
                vendor.created_at.strftime('%Y-%m-%d') if hasattr(vendor, 'created_at') else ''
            ])
        
        return response

    @action(detail=True, methods=['post'])
    def reset_password(self, request, pk=None):
        """
        Reset the password for the vendor's user account.
        """
        import secrets
        vendor = self.get_object()
        
        # Find associated user via VendorProfile
        profile = vendor.profiles.first()
        if not profile or not profile.user:
            return Response(
                {'error': 'No user account found for this vendor. Please activate the vendor first.'},
                status=404
            )
            
        user = profile.user
        
        # Generate new password
        temp_password = secrets.token_urlsafe(12)
        user.set_password(temp_password)
        user.save()
        
        # Log (or send email in future)
        print(f"Password reset for vendor {vendor.name} (User: {user.username})")
        
        return Response({
            'message': 'Password reset successfully',
            'username': user.username,
            'temp_password': temp_password,
            'email': user.email
        })


