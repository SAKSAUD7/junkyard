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
        """Return clean Azure Blob Storage URL for logo, bypassing Django storage URL generation."""
        if not obj.logo:
            return None
        # obj.logo.name holds the raw stored DB value (full Azure Blob URL or relative path)
        # We MUST NOT call obj.logo.url as AzureStorage.url() re-encodes already-absolute URLs
        raw = obj.logo.name if hasattr(obj.logo, 'name') and obj.logo.name else str(obj.logo)
        if not raw:
            return None
        # Already an absolute URL — return directly (force https)
        if raw.startswith('http://') or raw.startswith('https://'):
            return raw.replace('http://', 'https://', 1)
        # Relative path — build from request context
        request = self.context.get('request')
        if request:
            absolute_url = request.build_absolute_uri('/' + raw.lstrip('/'))
            return absolute_url.replace('http://', 'https://', 1)
        return raw

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

