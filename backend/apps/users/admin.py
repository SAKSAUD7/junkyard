from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, VendorProfile, CustomerProfile


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom user admin"""
    
    list_display = ['email', 'username', 'user_type', 'email_verified', 'is_active', 'created_at']
    list_filter = ['user_type', 'email_verified', 'is_active', 'is_staff']
    search_fields = ['email', 'username', 'first_name', 'last_name']
    ordering = ['-created_at']
    
    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'phone', 'avatar')}),
        ('Account Type', {'fields': ('user_type', 'email_verified')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined', 'created_at', 'updated_at')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2', 'user_type'),
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at', 'last_login', 'date_joined']


@admin.register(VendorProfile)
class VendorProfileAdmin(admin.ModelAdmin):
    """Vendor profile admin"""
    
    list_display = ['user', 'vendor', 'is_owner', 'can_edit', 'created_at']
    list_filter = ['is_owner', 'can_edit', 'can_respond_reviews']
    search_fields = ['user__email', 'vendor__name']
    raw_id_fields = ['user', 'vendor']
    readonly_fields = ['created_at']


@admin.register(CustomerProfile)
class CustomerProfileAdmin(admin.ModelAdmin):
    """Customer profile admin for Buyers/Consumers"""
    
    list_display = ['user', 'security_user_type', 'security_purpose', 'created_at']
    list_filter = ['security_user_type', 'security_purpose']
    search_fields = ['user__email', 'user__first_name', 'user__last_name']
    raw_id_fields = ['user']
    readonly_fields = ['created_at']
