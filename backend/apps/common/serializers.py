from rest_framework import serializers
from apps.hollander.models import Make, Model, PartType, State
from .models import ContactMessage


class MakeSerializer(serializers.ModelSerializer):
    makeID = serializers.IntegerField(source='make_id')
    makeName = serializers.CharField(source='make_name')
    
    class Meta:
        model = Make
        fields = ['makeID', 'makeName']


class ModelSerializer(serializers.ModelSerializer):
    modelID = serializers.IntegerField(source='model_id')
    modelName = serializers.CharField(source='model_name')
    makeID = serializers.IntegerField(source='make.make_id', read_only=True)
    
    class Meta:
        model = Model
        fields = ['modelID', 'modelName', 'makeID']


class PartSerializer(serializers.ModelSerializer):
    partID = serializers.IntegerField(source='part_id')
    partName = serializers.CharField(source='part_name')
    
    class Meta:
        model = PartType
        fields = ['partID', 'partName']


class StateSerializer(serializers.ModelSerializer):
    stateCode = serializers.CharField(source='state_code')
    stateName = serializers.CharField(source='name')
    
    class Meta:
        model = State
        fields = ['id', 'stateCode', 'stateName']


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ['id', 'name', 'email', 'subject', 'message', 'is_read', 'created_at']
        read_only_fields = ['is_read', 'created_at']

