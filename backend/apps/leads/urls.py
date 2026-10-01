from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LeadViewSet, VendorLeadViewSet, VehicleSubmissionViewSet, LeadDistributionViewSet

# Router for regular leads at /api/leads/
leads_router = DefaultRouter()
leads_router.register(r'distributions', LeadDistributionViewSet, basename='lead-distribution')
leads_router.register(r'', LeadViewSet, basename='lead')

# Router for vendor leads at /api/vendor-leads/
vendor_leads_router = DefaultRouter()
vendor_leads_router.register(r'', VendorLeadViewSet, basename='vendor-lead')

# Router for Sell Your Car submissions at /api/sell-your-car/
sell_car_router = DefaultRouter()
sell_car_router.register(r'', VehicleSubmissionViewSet, basename='sell-your-car')

# Export all URL patterns
leads_urlpatterns = leads_router.urls
vendor_leads_urlpatterns = vendor_leads_router.urls
sell_car_urlpatterns = sell_car_router.urls

# Default urlpatterns for /api/leads/
urlpatterns = leads_urlpatterns
