from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PublicCMSView, AdminCMSViewSet, AdminMediaViewSet

# Use a nested router under a fixed prefix to avoid
# DRF router slash-in-prefix conflicts.
content_router = DefaultRouter()
content_router.register(r'', AdminCMSViewSet, basename='cms-content')

media_router = DefaultRouter()
media_router.register(r'', AdminMediaViewSet, basename='cms-media')

urlpatterns = [
    # ── Public (no auth) ──────────────────────────────────────────────
    path('content/', PublicCMSView.as_view(), name='cms-public'),

    # ── Admin CMS (auth required) ─────────────────────────────────────
    # Routes:
    #   GET  /api/cms/admin/content/           → list
    #   POST /api/cms/admin/content/           → create
    #   GET  /api/cms/admin/content/<pk>/      → retrieve
    #   PUT  /api/cms/admin/content/<pk>/      → update
    #   PATCH /api/cms/admin/content/<pk>/     → partial update
    #   DELETE /api/cms/admin/content/<pk>/    → delete
    #   POST /api/cms/admin/content/bulk/      → bulk update
    #   POST /api/cms/admin/content/seed/      → seed defaults
    #   GET  /api/cms/admin/content/pages/     → list distinct pages
    path('admin/content/', include(content_router.urls)),

    # ── Admin Media ───────────────────────────────────────────────────
    path('admin/media/', include(media_router.urls)),
]
