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


# Extended Data Registrations

from .models import (
    Vendor, VendorDetail, VendorHours, VendorRating,
    HollanderMakeModelRef, HollanderPartRef, HollanderIndex, VehicleImage,
    State, Zipcode,
    LegacyAccount, LegacyUser, Association,
    Country,
    PresetMake, PresetMakeItem,
    PresetModel, PresetModelItem,
    PresetPart, PresetPartItem,
    PresetLocation, PresetLocationItem,
    PresetModel, PresetModelItem,
    PresetPart, PresetPartItem,
    PresetLocation, PresetLocationItem,
    PresetVehicle, PresetVehicleItem,
    ProfileVisit
)




@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = ['yard_id', 'name', 'city', 'state', 'phone']
    search_fields = ['name', 'yard_id', 'city']
    list_filter = ['state', 'is_active']
    ordering = ['name']

@admin.register(VendorDetail)
class VendorDetailAdmin(admin.ModelAdmin):
    list_display = ['vendor', 'in_business_since', 'warranty_type']
    search_fields = ['vendor__name']

@admin.register(VendorRating)
class VendorRatingAdmin(admin.ModelAdmin):
    list_display = ['vendor', 'rate_id', 'service_score', 'first_name', 'date_posted']
    search_fields = ['vendor__name', 'comment']
    list_filter = ['service_score', 'quality_score']

@admin.register(VendorHours)
class VendorHoursAdmin(admin.ModelAdmin):
    list_display = ['vendor', 'weekday_id', 'open_time', 'close_time']
    list_filter = ['weekday_id']

@admin.register(Zipcode)
class ZipcodeAdmin(admin.ModelAdmin):
    list_display = ['postal_code', 'city_name', 'state_abbr', 'latitude', 'longitude']
    search_fields = ['postal_code', 'city_name']
    list_filter = ['state_abbr']
    ordering = ['state_abbr', 'city_name']

@admin.register(State)
class StateAdmin(admin.ModelAdmin):
    list_display = ['state_code', 'name', 'country_id']
    ordering = ['name']

@admin.register(HollanderIndex)
class HollanderIndexAdmin(admin.ModelAdmin):
    list_display = ['idx_id', 'model_nm', 'part_type_nbr', 'begin_year', 'end_year']
    search_fields = ['idx_id', 'model_nm', 'part_type_nbr']
    ordering = ['idx_id']
    list_per_page = 50

@admin.register(VehicleImage)
class VehicleImageAdmin(admin.ModelAdmin):
    list_display = ['image_id', 'image_file_name', 'image_category_id']
    search_fields = ['image_file_name']

@admin.register(HollanderMakeModelRef)
class HollanderMakeModelRefAdmin(admin.ModelAdmin):
    list_display = ['h_make', 'h_model', 'h_make_code']
    search_fields = ['h_make', 'h_model']

@admin.register(HollanderPartRef)
class HollanderPartRefAdmin(admin.ModelAdmin):
    list_display = ['part_code', 'part_name']
    search_fields = ['part_name', 'part_code']

@admin.register(LegacyAccount)
class LegacyAccountAdmin(admin.ModelAdmin):
    list_display = ['account_id', 'name', 'contact_email', 'address_city', 'is_active']
    search_fields = ['name', 'contact_email']
    list_filter = ['is_active', 'address_state']

@admin.register(LegacyUser)
class LegacyUserAdmin(admin.ModelAdmin):
    list_display = ['user_id', 'email', 'first_name', 'last_name', 'is_active']
    search_fields = ['email', 'last_name']
    list_filter = ['is_active']

@admin.register(Association)
class AssociationAdmin(admin.ModelAdmin):
    list_display = ['association_id', 'name', 'state_code']
    search_fields = ['name']

# Phase 6
@admin.register(Country)
class CountryAdmin(admin.ModelAdmin):
    list_display = ['country_id', 'name']

class PresetItemInline(admin.TabularInline):
    extra = 1

class PresetMakeItemInline(PresetItemInline):
    model = PresetMakeItem

class PresetModelItemInline(PresetItemInline):
    model = PresetModelItem

class PresetPartItemInline(PresetItemInline):
    model = PresetPartItem

class PresetLocationItemInline(PresetItemInline):
    model = PresetLocationItem

class PresetVehicleItemInline(PresetItemInline):
    model = PresetVehicleItem

@admin.register(PresetMake)
class PresetMakeAdmin(admin.ModelAdmin):
    inlines = [PresetMakeItemInline]
    list_display = ['preset_id', 'name']

@admin.register(PresetModel)
class PresetModelAdmin(admin.ModelAdmin):
    inlines = [PresetModelItemInline]
    list_display = ['preset_id', 'name']

@admin.register(PresetPart)
class PresetPartAdmin(admin.ModelAdmin):
    inlines = [PresetPartItemInline]
    list_display = ['preset_id', 'name']

@admin.register(PresetLocation)
class PresetLocationAdmin(admin.ModelAdmin):
    inlines = [PresetLocationItemInline]
    list_display = ['preset_id', 'name']

@admin.register(PresetVehicle)
class PresetVehicleAdmin(admin.ModelAdmin):
    inlines = [PresetVehicleItemInline]
    list_display = ['preset_id', 'name']

# Phase 7
@admin.register(ProfileVisit)
class ProfileVisitAdmin(admin.ModelAdmin):
    list_display = ['tracking_id', 'account_id', 'created_on']
    list_filter = ['created_on']
    ordering = ['-created_on']



