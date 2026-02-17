from rest_framework import serializers
from .models import Advertisement

class AdvertisementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Advertisement
        fields = [
            'id', 'title', 'slot', 'page', 'image', 'redirect_url', 
            'is_active', 'template_type', 'button_text', 'show_badge',
            'start_date', 'end_date', 'priority', 'clicks', 'impressions',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['clicks', 'impressions', 'created_at', 'updated_at']
