from rest_framework import serializers
from .models import PartPricing


class PartPricingSerializer(serializers.ModelSerializer):
    """Serializer for Part Pricing data"""
    
    all_options = serializers.SerializerMethodField()
    
    class Meta:
        model = PartPricing
        fields = [
            'id', 'hollander_number', 'make', 'model', 'part_name',
            'year_start', 'year_end', 'new_price', 'wow_price', 'cts_price',
            'option1', 'option2', 'option3', 'option4', 'option5',
            'option6', 'option7', 'option8', 'option9', 'option10', 'option11',
            'all_options', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_all_options(self, obj):
        """Return all non-empty options as a comma-separated string"""
        return obj.get_all_options()
