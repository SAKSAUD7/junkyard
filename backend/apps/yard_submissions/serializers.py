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
            'logo',
            'images',
        ]
    
    def validate_business_name(self, value):
        """Validate business name"""
        if len(value) < 3:
            raise serializers.ValidationError("Business name must be at least 3 characters")
        return value
    
    def validate_description(self, value):
        """Validate description length"""
        if len(value) < 50:
            raise serializers.ValidationError("Description must be at least 50 characters")
        if len(value) > 2000:
            raise serializers.ValidationError("Description must be less than 2000 characters")
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
            from django.utils import timezone
            instance.reviewed_at = timezone.now()
        return super().update(instance, validated_data)
