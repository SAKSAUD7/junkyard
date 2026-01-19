from django.urls import path, include
from .views import AdvertisementListView, AdClickView

urlpatterns = [
    path('', AdvertisementListView.as_view(), name='ad-list'),
    path('<int:pk>/click/', AdClickView.as_view(), name='ad-click'),
]

from rest_framework.routers import DefaultRouter
from .views import AdvertisementViewSet

router = DefaultRouter()
router.register(r'manage', AdvertisementViewSet, basename='ad-manage')

urlpatterns += [
    path('', include(router.urls)),
]
