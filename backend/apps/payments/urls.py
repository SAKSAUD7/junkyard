from django.urls import path
from .views import (
    ChargeCardView, RefundView, WebhookView, TransactionDetailView,
    # Admin views
    TransactionListView, TransactionDetailAdminView,
    TransactionStatsView, WebhookEventListView, InvoiceListView,
)

urlpatterns = [
    # ── Customer / Public ─────────────────────────────────────────────
    path('charge/',          ChargeCardView.as_view(),       name='payment-charge'),
    path('<int:pk>/',        TransactionDetailView.as_view(), name='payment-detail'),
    path('<int:pk>/refund/', RefundView.as_view(),            name='payment-refund'),
    path('webhook/',         WebhookView.as_view(),           name='payment-webhook'),

    # ── Admin (IsAdminUser) ───────────────────────────────────────────
    path('admin/transactions/',          TransactionListView.as_view(),        name='admin-transaction-list'),
    path('admin/transactions/<int:pk>/', TransactionDetailAdminView.as_view(), name='admin-transaction-detail'),
    path('admin/stats/',                 TransactionStatsView.as_view(),       name='admin-payment-stats'),
    path('admin/webhooks/',              WebhookEventListView.as_view(),       name='admin-webhook-list'),
    path('admin/invoices/',              InvoiceListView.as_view(),            name='admin-invoice-list'),
]

