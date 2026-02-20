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
        """Return clean Azure Blob Storage URL for image, bypassing Django storage URL generation."""
        if not obj.image:
            return None
        # obj.image.name holds the raw stored DB value (full Azure Blob URL or relative path)
        # We MUST NOT call obj.image.url as AzureStorage.url() re-encodes already-absolute URLs
        raw = obj.image.name if hasattr(obj.image, 'name') and obj.image.name else str(obj.image)
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

