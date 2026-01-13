from rest_framework import serializers
from .models import Vendor


class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = [
            'id', 'name', 'address', 'city', 'state', 'zipcode', 
            'description', 'review_snippet', 'rating', 
            'rating_stars', 'rating_percentage', 
            'is_top_rated', 'is_featured', 'profile_url', 'logo',
            'is_trusted'
        ]

