from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    UserProfileView,
    ChangePasswordView,
    VendorProfileView,
    CustomerPasswordResetRequestView,
    CustomerPasswordResetConfirmView
)

urlpatterns = [
    # Authentication
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # User Profile
    path('me/', UserProfileView.as_view(), name='user-profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),

    # Vendor Profile
    path('vendor-profile/', VendorProfileView.as_view(), name='vendor-profile'),

    # Password Reset
    path('password-reset/', CustomerPasswordResetRequestView.as_view(), name='password-reset'),
    path('password-reset-confirm/', CustomerPasswordResetConfirmView.as_view(), name='password-reset-confirm'),
]
