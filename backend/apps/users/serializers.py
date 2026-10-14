from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, VendorProfile, CustomerProfile


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user details.

    Used by the self-service profile endpoint, so the privilege-bearing fields
    stay read-only: writing them let any logged-in customer promote itself.
    """
    
    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 
                  'user_type', 'phone', 'avatar', 'email_verified', 
                  'is_superuser', 'is_staff',
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'email', 'email_verified', 'created_at', 'updated_at',
                            'user_type', 'is_superuser', 'is_staff']


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    
    # New fields for onboarding questionnaire
    security_user_type = serializers.CharField(write_only=True, required=False, allow_blank=True)
    security_purpose = serializers.CharField(write_only=True, required=False, allow_blank=True)

    # The public signup page labels the customer role "buyer"; the model choices
    # only know "customer", so map it instead of answering 400 to every buyer.
    USER_TYPE_ALIASES = {'buyer': 'customer'}

    class Meta:
        model = User
        fields = ['email', 'username', 'password', 'password2', 'first_name', 
                  'last_name', 'user_type', 'phone', 'security_user_type', 'security_purpose']

    def to_internal_value(self, data):
        if isinstance(data, dict) and data.get('user_type') in self.USER_TYPE_ALIASES:
            data = {**data, 'user_type': self.USER_TYPE_ALIASES[data['user_type']]}
        return super().to_internal_value(data)

    def validate_user_type(self, value):
        # Registration is AllowAny; admin accounts come from the staff invite
        # flow (rbac.views) or Django admin, never from self-service signup.
        if value == 'admin':
            raise serializers.ValidationError('Admin accounts cannot be created through public registration.')
        return value
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        security_user_type = validated_data.pop('security_user_type', '')
        security_purpose = validated_data.pop('security_purpose', '')
        
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            user_type=validated_data.get('user_type', 'customer'),
            phone=validated_data.get('phone', '')
        )
        
        if user.user_type == 'customer':
            CustomerProfile.objects.create(
                user=user,
                security_user_type=security_user_type,
                security_purpose=security_purpose
            )
            
        return user


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change"""
    
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password2 = serializers.CharField(required=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({"new_password": "Password fields didn't match."})
        return attrs


class VendorProfileSerializer(serializers.ModelSerializer):
    """Serializer for vendor profile"""
    
    vendor_name = serializers.CharField(source='vendor.name', read_only=True)
    vendor_id = serializers.IntegerField(source='vendor.id', read_only=True)
    
    class Meta:
        model = VendorProfile
        fields = ['id', 'vendor_id', 'vendor_name', 'is_owner', 
                  'can_edit', 'can_respond_reviews', 'created_at']
        read_only_fields = ['id', 'created_at']
