from rest_framework import serializers
from .models import Lead


class LeadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lead
        fields = ['id', 'make', 'model', 'part', 'year', 'name', 'email', 'phone', 'location', 'status', 'created_at']
