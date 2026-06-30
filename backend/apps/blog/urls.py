from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BlogCategoryViewSet,
    PublicBlogViewSet,
    AdminBlogViewSet,
    AdminBlogCategoryViewSet,
    AdminBlogCommentViewSet,
    AdminAuthorViewSet,
    AdminBlogTagViewSet,
)

# Public router
public_router = DefaultRouter()
public_router.register(r'categories', BlogCategoryViewSet, basename='blog-category')
public_router.register(r'posts', PublicBlogViewSet, basename='blog-post')

# Admin router
admin_router = DefaultRouter()
admin_router.register(r'posts', AdminBlogViewSet, basename='admin-blog-post')
admin_router.register(r'categories', AdminBlogCategoryViewSet, basename='admin-blog-category')
admin_router.register(r'comments', AdminBlogCommentViewSet, basename='admin-blog-comment')
admin_router.register(r'authors', AdminAuthorViewSet, basename='admin-author')
admin_router.register(r'tags', AdminBlogTagViewSet, basename='admin-blog-tag')

urlpatterns = [
    path('', include(public_router.urls)),
    path('admin/', include(admin_router.urls)),
]
