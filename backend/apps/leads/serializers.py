from rest_framework import serializers
from .models import Lead


class LeadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lead
        fields = ['id', 'make', 'model', 'part', 'year', 'status', 'created_at']
        read_only_fields = ['id', 'created_at']
