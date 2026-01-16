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
from apps.leads.views import hollander_lookup


def health_check(request):
    """Health check endpoint"""
    return JsonResponse({"status": "ok"})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health_check, name="health_check"),
    path("api/auth/", include("apps.users.urls")),
    path("api/vendors/", include("apps.vendors.urls")),
    path("api/leads/", include("apps.leads.urls")),
    path("api/common/", include("apps.common.urls")),
    path("api/ads/", include("apps.ads.urls")),
    path("api/", include("apps.yard_submissions.urls")),  # Yard submissions API
    path("api/vendor/", include("apps.vendor_portal.urls")),  # Vendor portal API
    
    # Hollander lookup endpoint
    path("api/hollander/lookup/", hollander_lookup, name="hollander_lookup"),
    path("api/hollander/", include("apps.hollander.urls")),  # New reference data endpoints
]



# Serve media files in development
from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

