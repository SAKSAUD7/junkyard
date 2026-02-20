from rest_framework import serializers
from apps.hollander.models import Vendor


class VendorSerializer(serializers.ModelSerializer):
    # Frontend compatibility: add zipcode alias
    zipcode = serializers.CharField(source='zip_code', read_only=True)
    logo = serializers.SerializerMethodField()

    class Meta:
        model = Vendor
        fields = [
            'id', 'yard_id', 'name', 'address', 'city', 'state', 'zip_code', 'zipcode',
            'phone', 'email', 'website',
            'description', 'review_snippet', 'rating',
            'rating_stars', 'rating_percentage',
            'is_top_rated', 'is_featured', 'profile_url', 'logo',
            'is_trusted', 'is_active', 'username', 'leads_count'
        ]

    username = serializers.SerializerMethodField()
    leads_count = serializers.SerializerMethodField()

    def get_logo(self, obj):
        """Return absolute HTTPS URL for logo - handles Azure Blob Storage and local storage."""
        if not obj.logo:
            return None
        # Use .name to get the raw stored string — NOT .url which re-wraps it via storage
        logo_name = obj.logo.name if hasattr(obj.logo, 'name') else str(obj.logo)
        # If already an absolute URL (Azure Blob Storage), return it directly
        if logo_name.startswith('http://') or logo_name.startswith('https://'):
            return logo_name.replace('http://', 'https://', 1)
        # Build absolute URL using request context for relative paths
        request = self.context.get('request')
        if request:
            from django.conf import settings
            media_url = settings.MEDIA_URL + logo_name.lstrip('/')
            absolute_url = request.build_absolute_uri(media_url)
            return absolute_url.replace('http://', 'https://', 1)
        return logo_name

    def get_username(self, obj):
        # Get the first associated vendor profile and return its username
        profile = obj.profiles.first()
        if profile and profile.user:
            return profile.user.username
        return None

    def get_leads_count(self, obj):
        # Count the number of leads assigned to this vendor
        # NOTE: Lead assignment is currently DISABLED, so this always returns 0
        return 0

