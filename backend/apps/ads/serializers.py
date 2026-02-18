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
        # Get the URL from the ImageField
        image_url = obj.image.url if hasattr(obj.image, 'url') else str(obj.image)
        # If already an absolute URL (Azure Blob Storage), ensure HTTPS
        if image_url.startswith('http'):
            return image_url.replace('http://', 'https://', 1)
        # Build absolute URL using request context
        request = self.context.get('request')
        if request:
            absolute_url = request.build_absolute_uri(image_url)
            # Force HTTPS (Azure App Service terminates SSL at load balancer)
            return absolute_url.replace('http://', 'https://', 1)
        return image_url

