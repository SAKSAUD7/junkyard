from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MakeViewSet, ModelViewSet, PartViewSet,
    StateViewSet
)

router = DefaultRouter()
router.register(r'makes', MakeViewSet, basename='make')
router.register(r'models', ModelViewSet, basename='model')
router.register(r'parts', PartViewSet, basename='part')
router.register(r'states', StateViewSet, basename='state')

urlpatterns = [
    path('', include(router.urls)),
]
