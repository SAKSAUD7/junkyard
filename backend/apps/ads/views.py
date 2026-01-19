from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import models
from django.shortcuts import get_object_or_404, redirect
from django.utils import timezone
from .models import Advertisement
from .serializers import AdvertisementSerializer

class AdvertisementListView(generics.ListAPIView):
    serializer_class = AdvertisementSerializer

    def get_queryset(self):
        now = timezone.now().date()
        queryset = Advertisement.objects.filter(
            is_active=True,
            start_date__lte=now
        ).filter(
            models.Q(end_date__isnull=True) | models.Q(end_date__gte=now)
        )

        slot = self.request.query_params.get('slot')
        if slot:
            queryset = queryset.filter(slot=slot)
            
        target_page = self.request.query_params.get('target_page')
        if target_page:
            # Show ads for specific page OR ads for all pages
            queryset = queryset.filter(models.Q(page=target_page) | models.Q(page='all'))
            
            # Prioritize exact page matches over 'all' pages
            queryset = queryset.annotate(
                is_exact_page=models.Case(
                    models.When(page=target_page, then=models.Value(1)),
                    default=models.Value(0),
                    output_field=models.IntegerField(),
                )
            ).order_by('-is_exact_page', '-priority', '-created_at')
            
        return queryset

class AdClickView(APIView):
    def get(self, request, pk):
        ad = get_object_or_404(Advertisement, pk=pk)
        
        # Increment clicks atomically
        from django.db.models import F
        Advertisement.objects.filter(pk=pk).update(clicks=F('clicks') + 1)
        
        return redirect(ad.redirect_url)

from rest_framework import viewsets, permissions

class AdvertisementViewSet(viewsets.ModelViewSet):
    """
    Admin ViewSet for managing advertisements.
    Only accessible by admin users.
    """
    queryset = Advertisement.objects.all()
    serializer_class = AdvertisementSerializer
    permission_classes = [permissions.IsAdminUser]

