from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PublicCMSView, AdminCMSViewSet, AdminMediaViewSet

router = DefaultRouter()
router.register(r'admin/content', AdminCMSViewSet, basename='cms-content')
router.register(r'admin/media', AdminMediaViewSet, basename='cms-media')

urlpatterns = [
    path('content/', PublicCMSView.as_view(), name='cms-public'),
    path('', include(router.urls)),
]
