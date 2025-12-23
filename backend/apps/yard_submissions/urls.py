from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import YardSubmissionViewSet

router = DefaultRouter()
router.register(r'yard-submissions', YardSubmissionViewSet, basename='yard-submission')

urlpatterns = [
    path('', include(router.urls)),
]
