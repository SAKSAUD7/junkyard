"""
Hollander Admin Configuration
==============================
Django admin interface for all Hollander models
"""

from django.contrib import admin
from .models import (
    Make, Model, PartType, YearRange,
    HollanderInterchange, PartPricing, PartSpecification
)


@admin.register(Make)
class MakeAdmin(admin.ModelAdmin):
    list_display = ['make_id', 'make_name']
    search_fields = ['make_name']
    ordering = ['make_name']


@admin.register(Model)
class ModelAdmin(admin.ModelAdmin):
    list_display = ['model_id', 'make', 'model_name']
    list_filter = ['make']
    search_fields = ['model_name', 'make__make_name']
    ordering = ['make__make_name', 'model_name']


@admin.register(PartType)
class PartTypeAdmin(admin.ModelAdmin):
    list_display = ['part_id', 'part_name']
    search_fields = ['part_name']
    ordering = ['part_name']


@admin.register(YearRange)
class YearRangeAdmin(admin.ModelAdmin):
    list_display = ['make', 'model', 'year_start', 'year_end']
    list_filter = ['make']
    search_fields = ['make__make_name', 'model__model_name']
    ordering = ['make__make_name', 'model__model_name']


@admin.register(HollanderInterchange)
class HollanderInterchangeAdmin(admin.ModelAdmin):
    list_display = ['hollander_number', 'part_type', 'make', 'model', 'year_start', 'year_end', 'options']
    list_filter = ['part_type', 'make', 'year_start']
    search_fields = ['hollander_number', 'make', 'model', 'part_type', 'part_name']
    ordering = ['hollander_number']
    list_per_page = 50


@admin.register(PartPricing)
class PartPricingAdmin(admin.ModelAdmin):
    list_display = ['hollander_number', 'make', 'model', 'part_name', 'year_start', 'year_end', 'new_price', 'get_all_options']
    list_filter = ['make', 'year_start']
    search_fields = ['hollander_number', 'make', 'model', 'part_name']
    ordering = ['hollander_number']
    list_per_page = 50
    
    def get_all_options(self, obj):
        return obj.get_all_options()[:100]  # Truncate for display
    get_all_options.short_description = 'Options'


@admin.register(PartSpecification)
class PartSpecificationAdmin(admin.ModelAdmin):
    list_display = ['pricing', 'specification_name', 'specification_value']
    list_filter = ['specification_name']
    search_fields = ['specification_name', 'specification_value', 'pricing__hollander_number']
    ordering = ['pricing', 'specification_name']
