from django.contrib import admin
from .models import Lead, VendorLead


@admin.register(VendorLead)
class VendorLeadAdmin(admin.ModelAdmin):
    """Admin interface for Vendor Lead model"""
    list_display = ['id', 'year', 'make', 'model', 'name', 'phone', 'state', 'zip', 'status', 'created_at']
    list_filter = ['status', 'make', 'state', 'created_at']
    search_fields = ['make', 'model', 'name', 'email', 'phone']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'
    list_per_page = 50
    
    fieldsets = (
        ('Vehicle Information', {
            'fields': ('make', 'model', 'year')
        }),
        ('Contact Information', {
            'fields': ('name', 'email', 'phone', 'state', 'zip'),
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


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    """Admin interface for Lead model"""
    list_display = ['id', 'year', 'make', 'model', 'part', 'name', 'phone', 'state', 'zip', 'hollander_number', 'options', 'status', 'created_at']
    list_filter = ['status', 'make', 'created_at']
    search_fields = ['make', 'model', 'part', 'name', 'email', 'phone', 'hollander_number']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'
    list_per_page = 50
    
    fieldsets = (
        ('Vehicle Information', {
            'fields': ('make', 'model', 'year', 'part', 'hollander_number', 'options')
        }),
        ('Contact Information', {
            'fields': ('name', 'email', 'phone', 'state', 'zip', 'location'),
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

