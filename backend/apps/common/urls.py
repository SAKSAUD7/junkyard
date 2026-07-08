from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MakeViewSet, ModelViewSet, PartViewSet,
    StateViewSet, ContactMessageViewSet, FeedbackViewSet, AdminStatsView,
    SiteStatsView, UploadAndMigrateLeadDataView, SitemapView,
    CityListView
)

router = DefaultRouter()
router.register(r'makes', MakeViewSet, basename='make')
router.register(r'models', ModelViewSet, basename='model')
router.register(r'parts', PartViewSet, basename='part')
router.register(r'states', StateViewSet, basename='state')
router.register(r'messages', ContactMessageViewSet, basename='message')
router.register(r'feedback', FeedbackViewSet, basename='feedback')

urlpatterns = [
    path('', include(router.urls)),
    path('admin-stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('site-stats/', SiteStatsView.as_view(), name='site-stats'),
    path('cities/', CityListView.as_view(), name='cities'),
    path('migrate-lead-data/', UploadAndMigrateLeadDataView.as_view(), name='migrate-lead-data'),
    path('sitemap.xml', SitemapView.as_view(), name='sitemap-xml'),
]
