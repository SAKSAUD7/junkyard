from django.urls import path
from .views import ChargeCardView, RefundView, WebhookView, TransactionDetailView

urlpatterns = [
    path('charge/',          ChargeCardView.as_view(),       name='payment-charge'),
    path('<int:pk>/',        TransactionDetailView.as_view(), name='payment-detail'),
    path('<int:pk>/refund/', RefundView.as_view(),            name='payment-refund'),
    path('webhook/',         WebhookView.as_view(),           name='payment-webhook'),
]
