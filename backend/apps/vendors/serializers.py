from rest_framework import serializers
from apps.hollander.models import Vendor


class VendorSerializer(serializers.ModelSerializer):
    # Mock fields for UI compatibility until VendorDetail is linked
    is_trusted = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    review_snippet = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()
    
    class Meta:
        model = Vendor
        fields = [
            'id', 'yard_id', 'name', 'address', 'city', 'state', 'zip_code',
            'phone', 'email', 'website',
            'is_trusted', 'rating', 'review_snippet', 'description'
        ]
        
    def get_is_trusted(self, obj):
        # Temp logic: First 10 active vendors are trusted
        return obj.is_active and obj.id % 2 == 0 

    def get_rating(self, obj):
        return 4.8
        
    def get_review_snippet(self, obj):
        return "Excellent service and parts availability."
        
    def get_description(self, obj):
        return f"Premier auto recycler located in {obj.city}, {obj.state}."
