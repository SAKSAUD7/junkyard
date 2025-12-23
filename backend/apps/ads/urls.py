from django.urls import path
from .views import AdvertisementListView, AdClickView

urlpatterns = [
    path('', AdvertisementListView.as_view(), name='ad-list'),
    path('<int:pk>/click/', AdClickView.as_view(), name='ad-click'),
]
