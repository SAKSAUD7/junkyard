from rest_framework import serializers
from .models import YardSubmission


class YardSubmissionSerializer(serializers.ModelSerializer):
    """Serializer for yard submissions"""
    
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = YardSubmission
        fields = [
            'id',
            'business_name',
            'contact_name',
            'email',
            'phone',
            'website',
            'address',
            'city',
            'state',
            'zip_code',
            'services',
            'brands',
            'parts_categories',
            'description',
            'payment_methods',
            'business_hours',
            'subscription_plan',
            'toll_free',
            'fax',
            'owner_first_name',
            'owner_last_name',
            'owner_phone',
            'owner_email',
            'logo',
            'images',
            'status',
            'status_display',
            'admin_notes',
            'created_vendor',
            'created_at',
            'updated_at',
            'reviewed_at',
            'reviewed_by',
        ]
        read_only_fields = ['id', 'status', 'admin_notes', 'created_vendor', 'created_at', 'updated_at', 'reviewed_at', 'reviewed_by']
    
    def validate_email(self, value):
        """Validate email format"""
        return value.lower()
    
    def validate_phone(self, value):
        """Basic phone validation"""
        # Remove common formatting characters
        cleaned = ''.join(filter(str.isdigit, value))
        if len(cleaned) < 10:
            raise serializers.ValidationError("Phone number must have at least 10 digits")
        return value


class YardSubmissionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new yard submissions (public endpoint)"""

    # Allow blank for optional fields that the user may not fill in
    brands = serializers.CharField(required=False, allow_blank=True, default='')
    services = serializers.CharField(required=False, allow_blank=True, default='General Auto Parts & Services')
    parts_categories = serializers.CharField(required=False, allow_blank=True, default='')
    description = serializers.CharField(required=False, allow_blank=True, default='')
    toll_free = serializers.CharField(required=False, allow_blank=True, default='')
    fax = serializers.CharField(required=False, allow_blank=True, default='')
    owner_first_name = serializers.CharField(required=False, allow_blank=True, default='')
    owner_last_name = serializers.CharField(required=False, allow_blank=True, default='')
    owner_phone = serializers.CharField(required=False, allow_blank=True, default='')
    owner_email = serializers.EmailField(required=False, allow_blank=True, default='')
    address = serializers.CharField(required=False, allow_blank=True, default='')
    website = serializers.URLField(required=False, allow_blank=True, default='')
    
    class Meta:
        model = YardSubmission
        fields = [
            'business_name',
            'contact_name',
            'email',
            'phone',
            'website',
            'address',
            'city',
            'state',
            'zip_code',
            'services',
            'brands',
            'parts_categories',
            'description',
            'payment_methods',
            'business_hours',
            'subscription_plan',
            'toll_free',
            'fax',
            'owner_first_name',
            'owner_last_name',
            'owner_phone',
            'owner_email',
            'logo',
            'images',
        ]
    
    def validate_business_name(self, value):
        """Validate business name"""
        if len(value) < 3:
            raise serializers.ValidationError("Business name must be at least 3 characters")
        return value
    
    def validate_description(self, value):
        """Skip description length enforcement"""
        return value


class YardSubmissionAdminSerializer(serializers.ModelSerializer):
    """Serializer for admin operations"""
    
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = YardSubmission
        fields = '__all__'
    
    def update(self, instance, validated_data):
        """Update submission and track review"""
        if 'status' in validated_data and validated_data['status'] != instance.status:
            from django.utils import timezone  # type: ignore
            instance.reviewed_at = timezone.now()
        return super().update(instance, validated_data)
