from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import StaffRole, StaffMember

User = get_user_model()


class StaffRoleSerializer(serializers.ModelSerializer):
    member_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = StaffRole
        fields = [
            'id', 'name', 'description', 'color', 'member_count',
            'can_manage_cms', 'can_manage_vendors', 'can_manage_leads',
            'can_manage_ads', 'can_manage_blog', 'can_manage_messages',
            'can_manage_yard_submissions', 'can_manage_settings',
            'can_manage_roles', 'can_view_only',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'member_count']

    def get_member_count(self, obj):
        return obj.members.filter(is_active=True).count()


class StaffUserSerializer(serializers.ModelSerializer):
    """Minimal user info embedded in StaffMemberSerializer."""
    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 'user_type', 'is_active']


class StaffMemberSerializer(serializers.ModelSerializer):
    user = StaffUserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='user', write_only=True
    )
    role = StaffRoleSerializer(read_only=True)
    role_id = serializers.PrimaryKeyRelatedField(
        queryset=StaffRole.objects.all(), source='role', write_only=True
    )
    invited_by_email = serializers.SerializerMethodField(read_only=True)
    permissions = serializers.ReadOnlyField()

    class Meta:
        model = StaffMember
        fields = [
            'id', 'user', 'user_id', 'role', 'role_id',
            'is_active', 'notes', 'permissions',
            'invited_by', 'invited_by_email',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'invited_by', 'invited_by_email', 'permissions']

    def get_invited_by_email(self, obj):
        return obj.invited_by.email if obj.invited_by else None


class InviteStaffSerializer(serializers.Serializer):
    """Used when inviting a brand-new staff member by email."""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    first_name = serializers.CharField(max_length=100, required=False, default='')
    last_name = serializers.CharField(max_length=100, required=False, default='')
    role_id = serializers.PrimaryKeyRelatedField(queryset=StaffRole.objects.all())


class ResetPasswordSerializer(serializers.Serializer):
    """Used to manually reset a staff member's password by an admin."""
    new_password = serializers.CharField(write_only=True, required=True, min_length=6)


class MyPermissionsSerializer(serializers.Serializer):
    """Serializes the current user's role + permissions for the /me/ endpoint."""
    is_superuser = serializers.BooleanField()
    role_name = serializers.CharField(allow_null=True)
    role_color = serializers.CharField(allow_null=True)
    permissions = serializers.DictField()
