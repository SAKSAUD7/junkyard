from django.urls import path
from .views import (
    VendorDashboardView,
    VendorProfileView,
    VendorBusinessHoursView,
    VendorInventoryListView,
    VendorInventoryDetailView,
    VendorLeadListView,
    VendorLeadDetailView,
    VendorNotificationListView,
    VendorNotificationMarkReadView,
    VendorStatsView,
)
from .password_reset import VendorPasswordResetRequestView, VendorPasswordResetConfirmView

urlpatterns = [
    # Dashboard
    path('dashboard/', VendorDashboardView.as_view(), name='vendor-dashboard'),
    path('stats/', VendorStatsView.as_view(), name='vendor-stats'),
    
    # Profile
    path('profile/', VendorProfileView.as_view(), name='vendor-profile'),
    path('business-hours/', VendorBusinessHoursView.as_view(), name='vendor-business-hours'),
    
    # Inventory
    path('inventory/', VendorInventoryListView.as_view(), name='vendor-inventory-list'),
    path('inventory/<int:pk>/', VendorInventoryDetailView.as_view(), name='vendor-inventory-detail'),
    
    # Leads
    path('leads/', VendorLeadListView.as_view(), name='vendor-leads-list'),
    path('leads/<int:pk>/', VendorLeadDetailView.as_view(), name='vendor-lead-detail'),
    
    # Notifications
    path('notifications/', VendorNotificationListView.as_view(), name='vendor-notifications'),
    path('notifications/<int:pk>/read/', VendorNotificationMarkReadView.as_view(), name='vendor-notification-read'),
    
    # Password Reset
    path('password-reset/', VendorPasswordResetRequestView.as_view(), name='vendor-password-reset'),
    path('password-reset-confirm/', VendorPasswordResetConfirmView.as_view(), name='vendor-password-reset-confirm'),
]
