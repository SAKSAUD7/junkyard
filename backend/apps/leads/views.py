from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Lead
from .serializers import LeadSerializer


class LeadViewSet(viewsets.ModelViewSet):
    """
    API endpoint for lead submissions
    """
    queryset = Lead.objects.all()
    serializer_class = LeadSerializer
    
    def create(self, request, *args, **kwargs):
        """Create a new lead from form submission"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )
