"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from rest_framework.routers import DefaultRouter
from apps.hollander.views import hollander_lookup, PartPricingViewSet
from apps.leads.views import resolve_hollander_questions
from apps.hollander.import_views import VendorImportViewSet
from apps.leads.urls import vendor_leads_urlpatterns
from apps.ads.views import AdClickView  # Import ad click view

# Create router for Part Pricing and Vendor Import
pricing_router = DefaultRouter()
pricing_router.register(r'part-pricing', PartPricingViewSet, basename='part-pricing')

vendors_router = DefaultRouter()
vendors_router.register(r'import', VendorImportViewSet, basename='vendor-import')


def health_check(request):
    """Health check endpoint"""
    return JsonResponse({"status": "ok"})

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser

@api_view(['GET'])
@permission_classes([IsAdminUser])
def db_check(request):
    """Diagnostic endpoint - check DB connectivity and config (Admin Only)"""
    import os
    from django.conf import settings
    from django.db import connection, OperationalError
    
    db = settings.DATABASES.get('default', {})
    engine = db.get('ENGINE', 'unknown')
    host = db.get('HOST', '')
    user = db.get('USER', '')
    name = str(db.get('NAME', ''))
    port = db.get('PORT', '')
    options = db.get('OPTIONS', {})
    
    result = {
        "engine": engine,
        "host": host[:40] + "..." if len(host) > 40 else host,
        "user": user[:10] + "***" if len(user) > 10 else user,
        "name": name[:40] + "..." if len(name) > 40 else name,
        "port": port,
        "sslmode": options.get('sslmode', 'not set'),
        "db_env_set": bool(os.environ.get('DB_ENGINE')),
        "secret_key_set": bool(os.environ.get('SECRET_KEY')),
        "azure_key_set": bool(os.environ.get('AZURE_ACCOUNT_KEY')),
        "db_engine_env": os.environ.get('DB_ENGINE', '(not set)'),
    }
    
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        result["db_connected"] = True
    except Exception as e:
        result["db_connected"] = False
        result["db_error"] = str(e)[:500]
    
    return JsonResponse(result)

def home(request):
    """Root home view"""
    return JsonResponse({
        "message": "Welcome to the Junkyard API",
        "status": "running",
        "documentation": "/redoc/",
        "admin": "/admin/"
    })


urlpatterns = [
    path("", home, name="home"),
    path("admin/", admin.site.urls),
    
    # Ad click tracking (must be at root level, not under /api/)
    path("ads/<int:pk>/click/", AdClickView.as_view(), name="ad-click"),
    
    path("api/health/", health_check, name="health_check"),
    path("api/db-check/", db_check, name="db_check"),
    path("api/auth/", include("apps.users.urls")),
    path("api/vendors/", include("apps.vendors.urls")),
    path("api/vendors/", include(vendors_router.urls)),  # Import endpoints
    path("api/leads/", include("apps.leads.urls")),
    path("api/vendor-leads/", include(vendor_leads_urlpatterns)),  # Vendor leads endpoint
    path("api/common/", include("apps.common.urls")),
    path("api/ads/", include("apps.ads.urls")),
    path("api/", include("apps.yard_submissions.urls")),  # Yard submissions API
    path("api/vendor/", include("apps.vendor_portal.urls")),  # Vendor portal API
    
    # Hollander endpoints
    path("api/hollander/lookup/", hollander_lookup, name="hollander_lookup"),
    path("api/hollander/resolve-questions/", resolve_hollander_questions, name="resolve_hollander_questions"),
    path("api/hollander/", include("apps.hollander.urls")),  # New reference data endpoints
    
    # Part Pricing API
    path("api/", include(pricing_router.urls)),
    path("api/blog/", include("apps.blog.urls")),  # Blog system
    path("api/cms/", include("apps.cms.urls")),    # Website CMS
    path("api/rbac/", include("apps.rbac.urls")),  # Role-Based Access Control
]



# Serve media files in development
from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

