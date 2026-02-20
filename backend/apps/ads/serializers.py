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
        """Return absolute HTTPS URL for ad image."""
        if not obj.image:
            return None
        # Use .name to get the raw stored string — NOT .url which re-wraps it via storage
        image_name = obj.image.name if hasattr(obj.image, 'name') else str(obj.image)
        # If already an absolute URL (Azure Blob Storage), return it directly
        if image_name.startswith('http://') or image_name.startswith('https://'):
            return image_name.replace('http://', 'https://', 1)
        # Build absolute URL using request context for relative paths
        request = self.context.get('request')
        if request:
            from django.conf import settings
            media_url = settings.MEDIA_URL + image_name.lstrip('/')
            absolute_url = request.build_absolute_uri(media_url)
            return absolute_url.replace('http://', 'https://', 1)
        return image_name

