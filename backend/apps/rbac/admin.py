from django.contrib import admin
from .models import StaffRole, StaffMember


@admin.register(StaffRole)
class StaffRoleAdmin(admin.ModelAdmin):
    list_display = ['name', 'description', 'can_manage_cms', 'can_manage_vendors',
                    'can_manage_roles', 'can_view_only']
    list_filter = ['can_manage_cms', 'can_manage_roles', 'can_view_only']
    search_fields = ['name', 'description']


@admin.register(StaffMember)
class StaffMemberAdmin(admin.ModelAdmin):
    list_display = ['user', 'role', 'is_active', 'invited_by', 'created_at']
    list_filter = ['role', 'is_active']
    search_fields = ['user__email', 'user__username']
    raw_id_fields = ['user', 'invited_by']
    readonly_fields = ['created_at', 'updated_at']
