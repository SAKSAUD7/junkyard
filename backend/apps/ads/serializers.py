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
        """Return correct image URL — combines MEDIA_URL from settings with stored relative path."""
        if not obj.image:
            return None
        # Read the raw stored name (e.g. 'ads/image.png' or full https:// URL)
        raw = obj.image.name if hasattr(obj.image, 'name') and obj.image.name else str(obj.image)
        if not raw:
            return None
        # If already an absolute URL, return directly (force https)
        if raw.startswith('http://') or raw.startswith('https://'):
            return raw.replace('http://', 'https://', 1)
        # Relative path: combine with MEDIA_URL from settings (Azure Blob URL in production)
        from django.conf import settings
        media_url = settings.MEDIA_URL.rstrip('/')
        return f"{media_url}/{raw.lstrip('/')}"

