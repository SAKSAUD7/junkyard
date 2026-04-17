from django.contrib import admin
from .models import SiteContent, MediaAsset


@admin.register(SiteContent)
class SiteContentAdmin(admin.ModelAdmin):
    list_display = ['page', 'section', 'key', 'content_type', 'is_active', 'updated_at', 'updated_by']
    list_filter = ['page', 'section', 'content_type', 'is_active']
    search_fields = ['page', 'section', 'key', 'value', 'label']
    readonly_fields = ['updated_at', 'updated_by']
    list_per_page = 50

    fieldsets = (
        ('Identifier', {'fields': ('page', 'section', 'key')}),
        ('Content', {'fields': ('value', 'content_type', 'label', 'is_active')}),
        ('Meta', {'fields': ('updated_at', 'updated_by')}),
    )


@admin.register(MediaAsset)
class MediaAssetAdmin(admin.ModelAdmin):
    list_display = ['name', 'resolved_url', 'uploaded_at', 'uploaded_by']
    search_fields = ['name', 'alt_text']
    readonly_fields = ['uploaded_at', 'uploaded_by', 'resolved_url']
