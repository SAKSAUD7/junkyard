from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VendorViewSet, AdminVendorViewSet

from .views import VendorViewSet, AdminVendorViewSet

router = DefaultRouter()
router.register(r'manage', AdminVendorViewSet, basename='admin-vendor')
router.register(r'', VendorViewSet, basename='vendor')

urlpatterns = [
    path('', include(router.urls)),
]
