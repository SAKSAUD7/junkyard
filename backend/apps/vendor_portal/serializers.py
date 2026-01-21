from rest_framework import serializers
from apps.hollander.models import Vendor
from apps.leads.models import Lead, VendorLead
from apps.users.models import VendorProfile
from .models import VendorInventory, VendorNotification, VendorBusinessHours
from django.db.models import Count, Q
from datetime import datetime, timedelta


class VendorLeadForPortalSerializer(serializers.ModelSerializer):
    """Serializer for VendorLead in vendor portal"""
    
    customer_name = serializers.CharField(source='name', read_only=True)
    customer_email = serializers.EmailField(source='email', read_only=True)
    customer_phone = serializers.CharField(source='phone', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    # Add part field as empty string for consistency with regular leads
    part = serializers.SerializerMethodField()
    options = serializers.SerializerMethodField()
    hollander_number = serializers.SerializerMethodField()
    
    class Meta:
        model = VendorLead
        fields = [
            'id', 'make', 'model', 'year', 'part', 'options', 'hollander_number',
            'customer_name', 'customer_email', 'customer_phone',
            'state', 'zip', 'status', 'status_display', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_part(self, obj):
        return "General Vendor Inquiry"
    
    def get_options(self, obj):
        return ""
    
    def get_hollander_number(self, obj):
        return ""


class VendorDashboardSerializer(serializers.Serializer):
    """Dashboard overview statistics"""
    
    total_leads = serializers.IntegerField()
    new_leads = serializers.IntegerField()
    contacted_leads = serializers.IntegerField()
    converted_leads = serializers.IntegerField()
    closed_leads = serializers.IntegerField()
    recent_leads = serializers.SerializerMethodField()
    account_status = serializers.CharField()
    unread_notifications = serializers.IntegerField()
    
    def get_recent_leads(self, obj):
        # Return last 5 leads
        leads = obj.get('recent_leads', [])
        return VendorLeadSerializer(leads, many=True).data


class VendorBusinessHoursSerializer(serializers.ModelSerializer):
    """Business hours serializer"""
    
    day_name = serializers.CharField(source='get_day_of_week_display', read_only=True)
    
    class Meta:
        model = VendorBusinessHours
        fields = ['id', 'day_of_week', 'day_name', 'is_open', 'open_time', 'close_time', 'notes']


class VendorProfileUpdateSerializer(serializers.ModelSerializer):
    """Vendor profile management"""
    
    business_hours = VendorBusinessHoursSerializer(many=True, read_only=True)
    zipcode = serializers.CharField(source='zip_code')
    
    class Meta:
        model = Vendor
        fields = [
            'id', 'name', 'address', 'city', 'state', 'zipcode',
            'description', 'logo', 'rating_stars', 'rating_percentage',
            'is_top_rated', 'is_featured', 'business_hours'
        ]
        read_only_fields = ['id', 'rating_stars', 'rating_percentage', 'is_top_rated', 'is_featured']


class VendorInventorySerializer(serializers.ModelSerializer):
    """Inventory items (Makes, Models, Parts)"""
    
    class Meta:
        model = VendorInventory
        fields = [
            'id', 'item_type', 'make', 'model', 'part_name',
            'year_start', 'year_end', 'is_available', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate(self, data):
        """Validate hierarchical structure"""
        item_type = data.get('item_type')
        
        if item_type == 'make':
            if not data.get('make'):
                raise serializers.ValidationError("Make name is required for make type")
        elif item_type == 'model':
            if not data.get('make') or not data.get('model'):
                raise serializers.ValidationError("Make and Model are required for model type")
        elif item_type == 'part':
            if not data.get('make') or not data.get('model') or not data.get('part_name'):
                raise serializers.ValidationError("Make, Model, and Part name are required for part type")
        
        # Validate year range
        if data.get('year_start') and data.get('year_end'):
            if data['year_start'] > data['year_end']:
                raise serializers.ValidationError("Start year cannot be greater than end year")
        
        return data


class VendorLeadSerializer(serializers.ModelSerializer):
    """Lead information for vendors"""
    
    customer_name = serializers.CharField(source='name', read_only=True)
    customer_email = serializers.EmailField(source='email', read_only=True)
    customer_phone = serializers.CharField(source='phone', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Lead
        fields = [
            'id', 'make', 'model', 'year', 'part', 'options', 'hollander_number',
            'customer_name', 'customer_email', 'customer_phone',
            'state', 'zip', 'location', 'status', 'status_display',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'make', 'model', 'year', 'part', 'options', 'hollander_number',
            'customer_name', 'customer_email', 'customer_phone',
            'state', 'zip', 'location', 'created_at', 'updated_at'
        ]


class LeadStatusUpdateSerializer(serializers.Serializer):
    """Update lead status"""
    
    status = serializers.ChoiceField(choices=Lead.STATUS_CHOICES)
    
    def validate_status(self, value):
        """Ensure valid status transition"""
        valid_statuses = ['new', 'contacted', 'converted', 'closed']
        if value not in valid_statuses:
            raise serializers.ValidationError(f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
        return value


class VendorNotificationSerializer(serializers.ModelSerializer):
    """Vendor notifications"""
    
    type_display = serializers.CharField(source='get_notification_type_display', read_only=True)
    lead_info = serializers.SerializerMethodField()
    
    class Meta:
        model = VendorNotification
        fields = [
            'id', 'notification_type', 'type_display', 'title', 'message',
            'lead_info', 'is_read', 'read_at', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_lead_info(self, obj):
        """Return basic lead info if notification is related to a lead"""
        if obj.lead:
            return {
                'id': obj.lead.id,
                'vehicle': f"{obj.lead.year} {obj.lead.make} {obj.lead.model}",
                'part': obj.lead.part
            }
        return None
