from django.urls import path
from . import views

urlpatterns = [
    path('makes/', views.get_makes, name='get_makes'),
    path('models/', views.get_models, name='get_models'),
    path('years/', views.get_years, name='get_years'),
    path('parts/', views.get_parts, name='get_parts'),
    path('pincodes/search/', views.search_pincodes, name='search_pincodes'),
    path('lookup/', views.hollander_lookup, name='hollander_lookup'),
]
