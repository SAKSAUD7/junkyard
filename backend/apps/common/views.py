from rest_framework import viewsets
from .models import Make, Model, Part, State, City
from .serializers import (
    MakeSerializer, ModelSerializer, PartSerializer,
    StateSerializer, CitySerializer
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
    queryset = Part.objects.all()
    serializer_class = PartSerializer


class StateViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for states"""
    queryset = State.objects.all()
    serializer_class = StateSerializer


class CityViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for cities"""
    queryset = City.objects.all()
    serializer_class = CitySerializer
