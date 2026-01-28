from django.urls import path
from . import views
from .bulk_views import get_vehicle_data_bulk

urlpatterns = [
    path('makes/', views.get_makes, name='get_makes'),
    path('models/', views.get_models, name='get_models'),
    path('years/', views.get_years, name='get_years'),
    path('parts/', views.get_parts, name='get_parts'),
    path('pincodes/search/', views.search_pincodes, name='search_pincodes'),
    path('lookup/', views.hollander_lookup, name='hollander_lookup'),
    path('zipcode/lookup/', views.zipcode_lookup, name='zipcode_lookup'),
    path('zipcodes/state/', views.get_zipcodes_by_state, name='get_zipcodes_by_state'),
    # Bulk data endpoint for optimized lead form
    path('vehicle-data/<int:make_id>/', get_vehicle_data_bulk, name='vehicle_data_bulk'),
]
