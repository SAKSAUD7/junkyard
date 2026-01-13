from rest_framework import serializers
from apps.hollander.models import Vendor


class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = [
            'id', 'name', 'address', 'city', 'state', 'zip_code', 
            'description', 'review_snippet', 'rating', 
            'rating_stars', 'rating_percentage', 
            'is_top_rated', 'is_featured', 'profile_url', 'logo',
            'is_trusted'
        ]

