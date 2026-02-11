from django.contrib import admin
from .models import Advertisement

@admin.register(Advertisement)
class AdvertisementAdmin(admin.ModelAdmin):
    list_display = ('title', 'slot', 'page', 'template_type', 'is_active', 'start_date', 'end_date', 'priority', 'clicks', 'impressions')
    list_filter = ('slot', 'page', 'is_active', 'start_date', 'end_date')
    search_fields = ('title', 'redirect_url')
    ordering = ('-priority', '-created_at')
    readonly_fields = ('clicks', 'impressions', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Ad Details', {
            'fields': ('title', 'slot', 'page', 'image', 'redirect_url', 'priority')
        }),
        ('Template Customization', {
            'fields': ('template_type', 'button_text', 'show_badge'),
            'description': 'Customize the visual appearance of this ad'
        }),
        ('Scheduling', {
            'fields': ('start_date', 'end_date', 'is_active')
        }),
        ('Analytics', {
            'fields': ('clicks', 'impressions', 'created_at', 'updated_at')
        }),
    )
