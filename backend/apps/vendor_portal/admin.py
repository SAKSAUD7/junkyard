from django.contrib import admin
from .models import VendorInventory, VendorNotification, VendorBusinessHours


@admin.register(VendorInventory)
class VendorInventoryAdmin(admin.ModelAdmin):
    list_display = ['vendor', 'item_type', 'make', 'model', 'part_name', 'is_available', 'created_at']
    list_filter = ['item_type', 'is_available', 'vendor']
    search_fields = ['make', 'model', 'part_name', 'vendor__name']
    ordering = ['-created_at']


@admin.register(VendorNotification)
class VendorNotificationAdmin(admin.ModelAdmin):
    list_display = ['vendor', 'notification_type', 'title', 'lead', 'vendor_lead', 'get_state', 'is_read', 'created_at']
    list_filter = ['notification_type', 'is_read', 'vendor']
    search_fields = ['title', 'message', 'vendor__name']
    readonly_fields = ['lead', 'vendor_lead', 'created_at']
    ordering = ['-created_at']
    
    def get_state(self, obj):
        """Display the state from vendor_lead or lead"""
        if obj.vendor_lead:
            return obj.vendor_lead.state
        elif obj.lead:
            return obj.lead.state if hasattr(obj.lead, 'state') else '-'
        return '-'
    get_state.short_description = 'State'
    get_state.admin_order_field = 'vendor_lead__state'


@admin.register(VendorBusinessHours)
class VendorBusinessHoursAdmin(admin.ModelAdmin):
    list_display = ['vendor', 'day_of_week', 'is_open', 'open_time', 'close_time']
    list_filter = ['day_of_week', 'is_open', 'vendor']
    search_fields = ['vendor__name']
    ordering = ['vendor', 'day_of_week']
