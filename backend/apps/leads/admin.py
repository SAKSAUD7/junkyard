from django.contrib import admin
from .models import Lead


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ['make', 'model', 'part', 'year', 'status', 'created_at']
    list_filter = ['status', 'make', 'created_at']
    search_fields = ['make', 'model', 'part']
    ordering = ['-created_at']
