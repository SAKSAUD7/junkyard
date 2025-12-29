from django.contrib import admin
from .models import Lead


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    """Admin interface for Lead model"""
    list_display = ['id', 'year', 'make', 'model', 'part', 'status', 'created_at']
    list_filter = ['status', 'make', 'created_at']
    search_fields = ['make', 'model', 'part']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'
    list_per_page = 50
    
    fieldsets = (
        ('Vehicle Information', {
            'fields': ('make', 'model', 'year', 'part')
        }),
        ('Lead Status', {
            'fields': ('status',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
