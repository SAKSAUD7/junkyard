from django.urls import path
from .views import VinDecodeView

urlpatterns = [
    path('decode/', VinDecodeView.as_view(), name='vin_decode'),
]
