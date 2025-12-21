from rest_framework import serializers
from .models import Vendor


class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = [
            'id', 'name', 'address', 'city', 'state', 'zipcode',
            'description', 'review_snippet', 'rating', 'profile_url', 'logo'
        ]
