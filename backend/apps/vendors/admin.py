from django.contrib import admin
from .models import Vendor


@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = ['name', 'city', 'state', 'zipcode', 'rating']
    list_filter = ['state', 'city']
    search_fields = ['name', 'city', 'state', 'zipcode']
    ordering = ['name']
