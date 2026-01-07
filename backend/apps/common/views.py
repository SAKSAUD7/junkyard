from rest_framework import viewsets
from apps.hollander.models import Make, Model, PartType, State
from .serializers import (
    MakeSerializer, ModelSerializer, PartSerializer,
    StateSerializer
)


class MakeViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for vehicle makes"""
    queryset = Make.objects.all()
    serializer_class = MakeSerializer


class ModelViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for vehicle models"""
    queryset = Model.objects.all()
    serializer_class = ModelSerializer

    def get_queryset(self):
        queryset = Model.objects.all()
        
        # Filter by makeID if provided (frontend uses camelCase)
        make_id = self.request.query_params.get('makeID', None) or self.request.query_params.get('make_id', None)
        if make_id:
            queryset = queryset.filter(make__make_id=make_id)
        
        return queryset


class PartViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for auto parts"""
    queryset = PartType.objects.all()
    serializer_class = PartSerializer


class StateViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for states"""
    queryset = State.objects.all()
    serializer_class = StateSerializer
