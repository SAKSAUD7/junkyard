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
            'is_trusted', 'trusted_vendor', 'is_active', 'username', 'leads_count', 'ad_plan'
        ]

    username = serializers.SerializerMethodField()
    leads_count = serializers.SerializerMethodField()
    ad_plan = serializers.SerializerMethodField()
    
    def get_ad_plan(self, obj):
        active_ad = getattr(obj, 'ads', None)
        if active_ad:
            ad = obj.ads.filter(status='active').first()
            if ad:
                return ad.plan_type
        return None

    def get_logo(self, obj):
        """Return correct image URL — combines MEDIA_URL from settings with stored relative path."""
        if not obj.logo:
            return None
        # Read the raw stored name (e.g. 'vendors/logo-placeholder.png' or full https:// URL)
        raw = obj.logo.name if hasattr(obj.logo, 'name') and obj.logo.name else str(obj.logo)
        if not raw:
            return None
        # If already an absolute URL, return directly (force https)
        if raw.startswith('http://') or raw.startswith('https://'):
            return raw.replace('http://', 'https://', 1)
        # Relative path: combine with MEDIA_URL from settings (Azure Blob URL in production)
        from django.conf import settings
        media_url = settings.MEDIA_URL.rstrip('/')
        return f"{media_url}/{raw.lstrip('/')}"

    def get_username(self, obj):
        # Get the first associated vendor profile and return its username
        profile = obj.profiles.first()
        if profile and profile.user:
            return profile.user.username
        return None

    def get_leads_count(self, obj):
        # Count the number of leads assigned to this vendor
        if hasattr(obj, 'leads'):
            return obj.leads.count()
        return 0

