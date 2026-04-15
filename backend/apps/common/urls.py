from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MakeViewSet, ModelViewSet, PartViewSet,
    StateViewSet, ContactMessageViewSet, AdminStatsView,
    SiteStatsView, UploadAndMigrateLeadDataView
)

router = DefaultRouter()
router.register(r'makes', MakeViewSet, basename='make')
router.register(r'models', ModelViewSet, basename='model')
router.register(r'parts', PartViewSet, basename='part')
router.register(r'states', StateViewSet, basename='state')
router.register(r'messages', ContactMessageViewSet, basename='message')

urlpatterns = [
    path('', include(router.urls)),
    path('admin-stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('site-stats/', SiteStatsView.as_view(), name='site-stats'),
    path('migrate-lead-data/', UploadAndMigrateLeadDataView.as_view(), name='migrate-lead-data'),
]
