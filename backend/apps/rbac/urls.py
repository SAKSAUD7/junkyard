from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StaffRoleViewSet, StaffMemberViewSet, MyPermissionsView

router = DefaultRouter()
router.register(r'roles', StaffRoleViewSet, basename='rbac-roles')
router.register(r'staff', StaffMemberViewSet, basename='rbac-staff')

urlpatterns = [
    path('me/', MyPermissionsView.as_view(), name='rbac-me'),
    path('', include(router.urls)),
]
