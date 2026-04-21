from rest_framework import serializers
from django.utils import timezone
from .models import Advertisement


class FlexibleImageField(serializers.ImageField):
    """
    ImageField that accepts both file uploads AND URL strings.
    If a URL string is passed (e.g. the existing image URL), it's ignored
    (treated as no-change) rather than raising a validation error.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def to_internal_value(self, data):
        # If data is a string (URL), skip validation and return None (no change)
        if isinstance(data, str):
            return None
            
        # If it's a file, run validation
        if hasattr(data, 'size'):
            # 10MB limit
            if data.size > 10 * 1024 * 1024:
                raise serializers.ValidationError("File size should not exceed 10MB.")
                
            # ContentType check (though ImageField does use Pillow, it's good to be explicit for JPG/PNG restrictions)
            valid_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'video/mp4']
            if hasattr(data, 'content_type') and data.content_type not in valid_types:
                raise serializers.ValidationError("Invalid file type. Only JPG, PNG, WebP, and MP4 are allowed.")
                
        return super().to_internal_value(data)


class AdvertisementSerializer(serializers.ModelSerializer):
    image = FlexibleImageField(required=False, allow_null=True)
    resolved_image_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Advertisement
        fields = [
            'id', 'title', 'slot', 'page', 'image', 'resolved_image_url', 'redirect_url',
            'is_active', 'template_type', 'button_text', 'show_badge',
            'start_date', 'end_date', 'priority', 'clicks', 'impressions',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['clicks', 'impressions', 'created_at', 'updated_at', 'resolved_image_url']

    def get_resolved_image_url(self, obj):
        """Return correct image URL using Django's storage backend (.url property).

        Works correctly with both Azure Blob Storage (production) and
        local filesystem storage (development) without manual URL construction
        that can cause double-encoding or 404 errors.
        """
        if not obj.image:
            return None
        try:
            url = obj.image.url
            if not url:
                return None
            return url.replace('http://', 'https://', 1) if url.startswith('http://') else url
        except Exception:
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

    def validate(self, data):
        start_date = data.get('start_date')
        end_date = data.get('end_date')

        start = start_date if start_date is not None else (self.instance.start_date if self.instance else None)
        end = end_date if end_date is not None else (self.instance.end_date if self.instance else None)

        if start and end and end < start:
            raise serializers.ValidationError({"end_date": "End date cannot be before start date"})

        if not self.instance and start_date and start_date < timezone.now().date():
            raise serializers.ValidationError({"start_date": "Start date cannot be in the past"})

        return data

    def update(self, instance, validated_data):
        # If image came as None (URL string that was ignored), don't overwrite existing image
        image = validated_data.get('image', None)
        if 'image' in validated_data and image is None:
            validated_data.pop('image')
        return super().update(instance, validated_data)

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        # Override the normal image field representation with our resolved URL
        # so frontend doesn't need to change `ad.image` to `ad.resolved_image_url`
        ret['image'] = ret.get('resolved_image_url', None)
        return ret
