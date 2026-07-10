from django.contrib import admin
from .models import Make, Model, Part, State, City, ContactMessage, Feedback


@admin.register(Make)
class MakeAdmin(admin.ModelAdmin):
    list_display = ['make_id', 'make_name']
    search_fields = ['make_name']
    ordering = ['make_name']


@admin.register(Model)
class ModelAdmin(admin.ModelAdmin):
    list_display = ['model_id', 'model_name', 'make']
    list_filter = ['make']
    search_fields = ['model_name']
    ordering = ['model_name']


@admin.register(Part)
class PartAdmin(admin.ModelAdmin):
    list_display = ['part_id', 'part_name']
    search_fields = ['part_name']
    ordering = ['part_name']


@admin.register(State)
class StateAdmin(admin.ModelAdmin):
    list_display = ['state_id', 'state_name', 'state_code']
    search_fields = ['state_name', 'state_code']
    ordering = ['state_name']


@admin.register(City)
class CityAdmin(admin.ModelAdmin):
    list_display = ['city_id', 'city_name', 'state']
    list_filter = ['state']
    search_fields = ['city_name', 'state']
    ordering = ['city_name']


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ['subject', 'name', 'email', 'is_read', 'created_at']
    list_filter = ['is_read', 'created_at']
    search_fields = ['name', 'email', 'subject', 'message']
    ordering = ['-created_at']


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ['topic', 'status', 'created_at']
    list_filter = ['status', 'topic', 'created_at']
    search_fields = ['description']
    ordering = ['-created_at']
