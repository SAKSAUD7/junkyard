from rest_framework import serializers
from .models import Lead


class LeadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lead
        fields = [
            'id', 
            'make', 
            'model', 
            'part', 
            'year', 
            'name', 
            'email', 
            'phone', 
            'state',  # NEW
            'zip',  # NEW
            'location',  # Legacy field (kept for backwards compatibility)
            'options',  # NEW - part specifications
            'hollander_number',  # NEW - Hollander interchange number
            'status', 
            'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'status']

