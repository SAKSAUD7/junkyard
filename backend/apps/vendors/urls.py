from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VendorViewSet, AdminVendorViewSet
from .import_views import upload_vendor_csv, confirm_vendor_import, download_error_report

router = DefaultRouter()
router.register(r'manage', AdminVendorViewSet, basename='admin-vendor')
router.register(r'', VendorViewSet, basename='vendor')

urlpatterns = [
    path('', include(router.urls)),
    # CSV Import endpoints
    path('import/upload/', upload_vendor_csv, name='vendor-import-upload'),
    path('import/confirm/', confirm_vendor_import, name='vendor-import-confirm'),
    path('import/<str:upload_id>/error_report/', download_error_report, name='vendor-import-error-report'),
]
