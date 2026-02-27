from rest_framework import serializers
from .models import Advertisement


class AdvertisementSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = Advertisement
        fields = [
            'id', 'title', 'slot', 'page', 'image', 'redirect_url',
            'is_active', 'template_type', 'button_text', 'show_badge',
            'start_date', 'end_date', 'priority', 'clicks', 'impressions',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['clicks', 'impressions', 'created_at', 'updated_at']

    def get_image(self, obj):
        """Return correct image URL using Django's storage backend (.url property).
        
        Works correctly with both Azure Blob Storage (production) and
        local filesystem storage (development) without manual URL construction
        that can cause double-encoding or 404 errors.
        """
        if not obj.image:
            return None
        try:
            # Use Django's storage backend to generate the correct URL.
            # For AzureStorage this returns the full Azure Blob URL.
            # For local storage this returns '/media/ads/...'
            url = obj.image.url
            if not url:
                return None
            # Ensure https in production (Azure returns https already, but be safe)
            return url.replace('http://', 'https://', 1) if url.startswith('http://') else url
        except Exception:
            # Fallback: try raw name if .url fails
            try:
                raw = obj.image.name if hasattr(obj.image, 'name') and obj.image.name else str(obj.image)
                if not raw:
                    return None
                if raw.startswith('http://') or raw.startswith('https://'):
                    return raw.replace('http://', 'https://', 1)
                from django.conf import settings
                media_url = settings.MEDIA_URL.rstrip('/')
                return f"{media_url}/{raw.lstrip('/')}"
            except Exception:
                return None

