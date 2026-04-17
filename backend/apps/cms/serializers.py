from rest_framework import serializers
from .models import SiteContent, MediaAsset


class SiteContentSerializer(serializers.ModelSerializer):
    updated_by_email = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = SiteContent
        fields = [
            'id', 'page', 'section', 'key', 'value',
            'content_type', 'label', 'is_active',
            'updated_at', 'updated_by', 'updated_by_email'
        ]
        read_only_fields = ['id', 'updated_at', 'updated_by', 'updated_by_email']

    def get_updated_by_email(self, obj):
        return obj.updated_by.email if obj.updated_by else None


class SiteContentPublicSerializer(serializers.ModelSerializer):
    """Lightweight serializer for public endpoint — just page/section/key/value."""
    class Meta:
        model = SiteContent
        fields = ['section', 'key', 'value', 'content_type', 'is_active']


class BulkUpdateSerializer(serializers.Serializer):
    """Accept a list of {id, value} pairs to update multiple fields at once."""
    updates = serializers.ListField(
        child=serializers.DictField(),
        allow_empty=False
    )


class MediaAssetSerializer(serializers.ModelSerializer):
    resolved_url = serializers.ReadOnlyField()
    uploaded_by_email = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = MediaAsset
        fields = [
            'id', 'name', 'file', 'url', 'alt_text',
            'resolved_url', 'uploaded_at', 'uploaded_by', 'uploaded_by_email'
        ]
        read_only_fields = ['id', 'uploaded_at', 'uploaded_by', 'uploaded_by_email', 'resolved_url']

    def get_uploaded_by_email(self, obj):
        return obj.uploaded_by.email if obj.uploaded_by else None
