from django.contrib import admin
from .models import Lead, VendorLead, VehicleSubmission


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


@admin.register(VehicleSubmission)
class VehicleSubmissionAdmin(admin.ModelAdmin):
    """Admin CMS for the 'Sell Your Vehicle' lead form submissions"""
    list_display = [
        'id', 'vin', 'year', 'make', 'model', 'trim',
        'name', 'phone', 'email', 'zip_code',
        'drivable', 'mileage', 'body_damage',
        'status', 'created_at'
    ]
    list_filter = [
        'status', 'make', 'drivable', 'body_damage',
        'engine_issue', 'transmission_issue', 'has_title', 'has_keys', 'created_at'
    ]
    search_fields = ['name', 'email', 'phone', 'make', 'model', 'vin', 'zip_code']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'
    list_per_page = 50
    list_editable = ['status']

    fieldsets = (
        ('Vehicle Identification', {
            'fields': ('vin', 'year', 'make', 'model', 'trim'),
            'description': 'Vehicle details from VIN decode or manual entry'
        }),
        ('Vehicle Condition', {
            'fields': (
                'mileage', 'body_damage',
                'drivable', 'starts',
                'has_title', 'has_keys', 'has_all_tires',
                'engine_issue', 'transmission_issue', 'transportation_required'
            ),
        }),
        ('Seller Contact & Location', {
            'fields': ('name', 'email', 'phone', 'zip_code', 'state', 'city'),
            'description': 'Contact info and location provided by the seller'
        }),
        ('Customer Notes', {
            'fields': ('description',),
        }),
        ('Lead Status', {
            'fields': ('status',),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
