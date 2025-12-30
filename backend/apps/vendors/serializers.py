from rest_framework import serializers
from .models import Vendor


class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = [
            'id', 'name', 'address', 'city', 'state', 'zipcode',
            'description', 'review_snippet', 'rating', 'profile_url', 'logo',
            'is_trusted', 'trust_level',
            'rating_stars', 'rating_percentage', 'is_top_rated', 'is_featured'
        ]
