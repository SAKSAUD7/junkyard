from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LeadViewSet, VendorLeadViewSet

# Router for regular leads at /api/leads/
leads_router = DefaultRouter()
leads_router.register(r'', LeadViewSet, basename='lead')

# Router for vendor leads at /api/vendor-leads/
vendor_leads_router = DefaultRouter()
vendor_leads_router.register(r'', VendorLeadViewSet, basename='vendor-lead')

# Export both URL patterns
leads_urlpatterns = leads_router.urls
vendor_leads_urlpatterns = vendor_leads_router.urls

# Default urlpatterns for /api/leads/
urlpatterns = leads_urlpatterns

