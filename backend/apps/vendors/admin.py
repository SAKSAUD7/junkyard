from django.contrib import admin
from django.utils.html import format_html
from .models import Vendor


@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = ['name', 'city', 'state', 'logo_preview', 'has_logo', 'is_trusted', 'rating']
    list_filter = ['state', 'is_trusted', 'trust_level']
    search_fields = ['name', 'city', 'state', 'zipcode', 'address']
    ordering = ['name']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'address', 'city', 'state', 'zipcode')
        }),
        ('Contact & Details', {
            'fields': ('description', 'review_snippet', 'rating', 'profile_url')
        }),
        ('Branding & Logo', {
            'fields': ('logo', 'logo_preview_large'),
            'description': 'Enter the path to the vendor logo image (e.g., /images/vendors/logo.png)'
        }),
        ('Trust & Priority', {
            'fields': ('is_trusted', 'trust_level'),
            'description': 'Mark as trusted vendor for premium display. Higher trust level = more prominent placement.'
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['logo_preview_large', 'created_at', 'updated_at']
    
    def logo_preview(self, obj):
        """Small logo preview for list view"""
        if obj.logo and obj.logo != '/images/logo-placeholder.png':
            return format_html(
                '<img src="{}" style="max-height: 40px; max-width: 80px; border-radius: 4px;" />',
                obj.logo
            )
        return format_html('<span style="color: #999;">No logo</span>')
    logo_preview.short_description = 'Logo'
    
    def logo_preview_large(self, obj):
        """Large logo preview for detail view"""
        if obj.logo and obj.logo != '/images/logo-placeholder.png':
            return format_html(
                '<div style="padding: 10px; background: #f5f5f5; border-radius: 8px; display: inline-block;">'
                '<img src="{}" style="max-height: 200px; max-width: 300px; display: block;" />'
                '</div>',
                obj.logo
            )
        return format_html(
            '<div style="padding: 20px; background: #f5f5f5; border-radius: 8px; text-align: center; color: #999;">'
            'No logo uploaded<br><small>Enter logo path above to display vendor logo</small>'
            '</div>'
        )
    logo_preview_large.short_description = 'Current Logo Preview'
    
    def has_logo(self, obj):
        """Boolean indicator if vendor has a custom logo"""
        return obj.logo != '/images/logo-placeholder.png'
    has_logo.boolean = True
    has_logo.short_description = 'Has Logo'
    
    # Add custom actions
    actions = ['mark_as_trusted', 'remove_trust']
    
    def mark_as_trusted(self, request, queryset):
        """Mark selected vendors as trusted"""
        updated = queryset.update(is_trusted=True, trust_level=5)
        self.message_user(request, f'{updated} vendor(s) marked as trusted.')
    mark_as_trusted.short_description = 'Mark as trusted vendor'
    
    def remove_trust(self, request, queryset):
        """Remove trusted status from selected vendors"""
        updated = queryset.update(is_trusted=False, trust_level=0)
        self.message_user(request, f'{updated} vendor(s) trust status removed.')
    remove_trust.short_description = 'Remove trusted status'
