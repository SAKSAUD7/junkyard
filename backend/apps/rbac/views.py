import secrets
import logging
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .permissions import IsAdminOrStaff
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth import get_user_model

from .models import StaffRole, StaffMember
from .serializers import (
    StaffRoleSerializer,
    StaffMemberSerializer,
    InviteStaffSerializer,
    ResetPasswordSerializer,
    MyPermissionsSerializer,
)

User = get_user_model()
logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────────────────
# ROLES  (Admin only)
# ─────────────────────────────────────────────────────────────────────────────
class StaffRoleViewSet(viewsets.ModelViewSet):
    """
    CRUD for roles — admin only.
      GET    /api/rbac/roles/
      POST   /api/rbac/roles/
      GET    /api/rbac/roles/{id}/
      PATCH  /api/rbac/roles/{id}/
      DELETE /api/rbac/roles/{id}/
      POST   /api/rbac/roles/seed/  → seed Admin/Manager/Employee defaults
    """
    queryset = StaffRole.objects.all()
    serializer_class = StaffRoleSerializer
    permission_classes = [IsAdminOrStaff]
    authentication_classes = [JWTAuthentication]

    def destroy(self, request, *args, **kwargs):
        role = self.get_object()
        if role.members.filter(is_active=True).exists():
            return Response(
                {'error': 'Cannot delete a role with active staff members. Reassign them first.'},
                status=400
            )
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=['post'], url_path='seed')
    def seed_defaults(self, request):
        """Seed the three default roles if they don't already exist."""
        defaults = [
            {
                'name': 'Admin',
                'description': 'Full access to everything in the admin portal.',
                'color': '#ef4444',
                'can_manage_cms': True,
                'can_manage_vendors': True,
                'can_manage_leads': True,
                'can_manage_ads': True,
                'can_manage_blog': True,
                'can_manage_messages': True,
                'can_manage_yard_submissions': True,
                'can_manage_settings': True,
                'can_manage_roles': True,
                'can_view_only': False,
            },
            {
                'name': 'Manager',
                'description': 'Can edit CMS, vendors, leads, ads, and blog. Cannot manage roles or settings.',
                'color': '#f97316',
                'can_manage_cms': True,
                'can_manage_vendors': True,
                'can_manage_leads': True,
                'can_manage_ads': True,
                'can_manage_blog': True,
                'can_manage_messages': True,
                'can_manage_yard_submissions': True,
                'can_manage_settings': False,
                'can_manage_roles': False,
                'can_view_only': False,
            },
            {
                'name': 'Employee',
                'description': 'Read-only access across all modules. No editing.',
                'color': '#6366f1',
                'can_manage_cms': False,
                'can_manage_vendors': False,
                'can_manage_leads': False,
                'can_manage_ads': False,
                'can_manage_blog': False,
                'can_manage_messages': False,
                'can_manage_yard_submissions': False,
                'can_manage_settings': False,
                'can_manage_roles': False,
                'can_view_only': True,
            },
        ]
        created = 0
        for role_data in defaults:
            _, was_created = StaffRole.objects.get_or_create(
                name=role_data['name'], defaults=role_data
            )
            if was_created:
                created += 1
        return Response({'message': f'Seeded {created} default role(s).'})


# ─────────────────────────────────────────────────────────────────────────────
# STAFF MEMBERS  (Admin only)
# ─────────────────────────────────────────────────────────────────────────────
class StaffMemberViewSet(viewsets.ModelViewSet):
    """
    CRUD for staff members — admin only.
      GET    /api/rbac/staff/
      POST   /api/rbac/staff/invite/  → create new user + assign role
      PATCH  /api/rbac/staff/{id}/    → change role / activate / deactivate
      DELETE /api/rbac/staff/{id}/    → remove staff access
    """
    queryset = StaffMember.objects.select_related('user', 'role', 'invited_by').all()
    serializer_class = StaffMemberSerializer
    permission_classes = [IsAdminOrStaff]
    authentication_classes = [JWTAuthentication]

    def perform_create(self, serializer):
        serializer.save(invited_by=self.request.user)

    @action(detail=False, methods=['post'], url_path='invite')
    def invite(self, request):
        """
        Create a brand-new user and assign them a staff role in one step.
        A random password is generated — send the user an invite email.
        """
        serializer = InviteStaffSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        email = serializer.validated_data['email']
        role = serializer.validated_data['role_id']

        if User.objects.filter(email=email).exists():
            # User already exists — just assign staff role
            user = User.objects.get(email=email)
            if hasattr(user, 'staff_profile'):
                app_member = user.staff_profile
                app_member.role = role
                app_member.is_active = True
                app_member.invited_by = request.user
                app_member.save()
                return Response({'message': f'Existing user {email} reassigned to role {role.name}.'})
        else:
            # Create new user with given password or random temp password
            given_password = serializer.validated_data.get('password', '').strip()
            temp_password = given_password if given_password else secrets.token_urlsafe(12)
            
            user = User.objects.create_user(
                email=email,
                username=email.split('@')[0],
                password=temp_password,
                first_name=serializer.validated_data.get('first_name', ''),
                last_name=serializer.validated_data.get('last_name', ''),
                user_type='admin',
                is_staff=True,
            )
            logger.info(f'[RBAC] Created new staff user: {email} (temp_password generated: {not bool(given_password)})')

        member = StaffMember.objects.create(
            user=user,
            role=role,
            is_active=True,
            invited_by=request.user,
        )
        return Response(
            StaffMemberSerializer(member).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'], url_path='reset_password')
    def reset_password(self, request, pk=None):
        """Allows an admin to manually reset the password of a staff member."""
        member = self.get_object()
        
        serializer = ResetPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)
            
        new_password = serializer.validated_data['new_password']
        
        user = member.user
        user.set_password(new_password)
        user.save()
        
        logger.info(f"[RBAC] Password reset for {user.email} by {request.user.email}")
        return Response({'message': f'Password for {user.email} has been successfully reset.'})


# ─────────────────────────────────────────────────────────────────────────────
# ME  (any authenticated staff)
# ─────────────────────────────────────────────────────────────────────────────
class MyPermissionsView(APIView):
    """
    GET /api/rbac/me/
    Returns the current user's role + full permissions dict.
    Superusers get all permissions = True automatically.
    """
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        user = request.user
        if user.is_superuser:
            return Response({
                'is_superuser': True,
                'role_name': 'Superuser',
                'role_color': '#ef4444',
                'permissions': {
                    'can_manage_cms': True,
                    'can_manage_vendors': True,
                    'can_manage_leads': True,
                    'can_manage_ads': True,
                    'can_manage_blog': True,
                    'can_manage_messages': True,
                    'can_manage_yard_submissions': True,
                    'can_manage_settings': True,
                    'can_manage_roles': True,
                    'can_view_only': False,
                }
            })

        try:
            member = user.staff_profile
            return Response({
                'is_superuser': False,
                'role_name': member.role.name,
                'role_color': member.role.color,
                'permissions': member.permissions,
            })
        except StaffMember.DoesNotExist:
            return Response({
                'is_superuser': False,
                'role_name': None,
                'role_color': None,
                'permissions': {},
            })
