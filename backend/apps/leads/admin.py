from django.contrib import admin
from .models import Lead


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    """Admin interface for Lead model"""
    list_display = ['id', 'year', 'make', 'model', 'part', 'name', 'email', 'phone', 'location', 'status', 'created_at']
    list_filter = ['status', 'make', 'created_at']
    search_fields = ['make', 'model', 'part', 'name', 'email', 'phone', 'location']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'
    list_per_page = 50
    
    fieldsets = (
        ('Vehicle Information', {
            'fields': ('make', 'model', 'year', 'part')
        }),
        ('Contact Information', {
            'fields': ('name', 'email', 'phone', 'location'),
            'description': 'Customer contact details'
        }),
        ('Lead Status', {
            'fields': ('status',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

