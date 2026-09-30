from rest_framework import serializers
from .models import Lead, VendorLead, VehicleSubmission


class VendorLeadSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorLead
        fields = [
            'id',
            'make',
            'model',
            'year',
            'name',
            'email',
            'phone',
            'state',
            'zip',
            'status',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'status']



class LeadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lead
        fields = [
            'id', 
            'make', 
            'model', 
            'part', 
            'year', 
            'name', 
            'email', 
            'phone', 
            'state',  # NEW
            'zip',  # NEW
            'location',  # Legacy field (kept for backwards compatibility)
            'options',  # NEW - part specifications
            'hollander_number',  # NEW - Hollander interchange number
            'lead_type',  # NEW - Distinguish between Quality Auto and Vendor leads
            'vendor',  # NEW - Linked vendor
            'status', 
            'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'status']


class VehicleSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleSubmission
        fields = [
            'id',
            'vin',
            'year',
            'make',
            'model',
            'trim',
            'mileage',
            'drivable',
            'starts',
            'transportation_required',
            'has_title',
            'has_keys',
            'has_all_tires',
            'body_damage',
            'engine_issue',
            'transmission_issue',
            'name',
            'email',
            'phone',
            'zip_code',
            'state',
            'city',
            'description',
            'status',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at', 'status']

