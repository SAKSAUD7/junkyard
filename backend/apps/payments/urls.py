from django.urls import path
from .views import ChargeCardView

urlpatterns = [
    path('charge/', ChargeCardView.as_view(), name='charge_card'),
]
