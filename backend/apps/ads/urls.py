from django.urls import path, include, register_converter
from .views import AdvertisementListView, AdClickView, AdImpressionView, AdSummaryView


class SignedIntConverter:
    """`int` only matches non-negative digits, so a malformed ad id like -1 would
    die in URL resolution with an HTML 404 instead of reaching the JSON contract."""
    regex = r'-?\d+'

    def to_python(self, value):
        return int(value)

    def to_url(self, value):
        return str(value)


register_converter(SignedIntConverter, 'signedint')

urlpatterns = [
    path('', AdvertisementListView.as_view(), name='ad-list'),
    path('<int:pk>/click/', AdClickView.as_view(), name='ad-click'),
    path('<signedint:pk>/impression/', AdImpressionView.as_view(), name='ad-impression'),
    path('summary/', AdSummaryView.as_view(), name='ad-summary'),
]

from rest_framework.routers import DefaultRouter
from .views import AdvertisementViewSet

router = DefaultRouter()
router.register(r'manage', AdvertisementViewSet, basename='ad-manage')

urlpatterns += [
    path('', include(router.urls)),
]
