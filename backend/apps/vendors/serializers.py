from rest_framework import serializers
from apps.hollander.models import Vendor


class VendorSerializer(serializers.ModelSerializer):
    # Frontend compatibility: add zipcode alias
    zipcode = serializers.CharField(source='zip_code', read_only=True)
    class Meta:
        model = Vendor
        fields = [
            'id', 'yard_id', 'name', 'address', 'city', 'state', 'zip_code', 'zipcode',
            'phone', 'email', 'website',
            'description', 'review_snippet', 'rating', 
            'rating_stars', 'rating_percentage', 
            'is_top_rated', 'is_featured', 'profile_url', 'logo',
            'is_trusted', 'is_active', 'username', 'leads_count'
        ]

    username = serializers.SerializerMethodField()
    leads_count = serializers.SerializerMethodField()

    def get_username(self, obj):
        # Get the first associated vendor profile and return its username
        profile = obj.profiles.first()
        if profile and profile.user:
            return profile.user.username
        return None
    
    def get_leads_count(self, obj):
        # Count the number of leads assigned to this vendor
        return obj.assigned_leads.count()

