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
        try:
            active_ad = getattr(obj, 'ads', None)
            if active_ad:
                ad = obj.ads.filter(status='active').first()
                if ad:
                    return ad.plan_type
            return None
        except Exception:
            return None

    def get_logo(self, obj):
        """Return absolute image URL using the request context — works on localhost and VPS."""
        if not obj.logo:
            return None

        # Get the raw stored value
        raw = obj.logo.name if hasattr(obj.logo, 'name') and obj.logo.name else str(obj.logo)
        if not raw:
            return None

        # Safety net: strip any leftover Azure blob URLs → extract just the relative path
        azure_prefix = 'https://junkyardstoragedev.blob.core.windows.net/media/'
        azure_prefix2 = 'http://junkyardstoragedev.blob.core.windows.net/media/'
        if raw.startswith(azure_prefix):
            raw = raw[len(azure_prefix):]
        elif raw.startswith(azure_prefix2):
            raw = raw[len(azure_prefix2):]

        # If it's still a full external URL (non-Azure), return it as-is
        if raw.startswith('http://') or raw.startswith('https://'):
            return raw

        # Build absolute URL using the request so it works on any host/port
        request = self.context.get('request')
        relative = f"/media/{raw.lstrip('/')}"
        if request:
            return request.build_absolute_uri(relative)

        # Fallback: return relative path if no request context
        return relative

    def get_username(self, obj):
        # Get the first associated vendor profile and return its username
        profile = obj.profiles.first()
        if profile and profile.user:
            return profile.user.username
        return None

    def get_leads_count(self, obj):
        try:
            # Count the number of leads assigned to this vendor
            if hasattr(obj, 'leads'):
                return obj.leads.count()
            return 0
        except Exception:
            return 0

