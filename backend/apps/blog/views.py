from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.pagination import PageNumberPagination
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.db.models import Q
from django.utils import timezone
import logging

from .models import BlogPost, BlogCategory, BlogComment, Author, BlogTag
from .serializers import (
    BlogPostListSerializer,
    BlogPostDetailSerializer,
    BlogPostAdminSerializer,
    BlogCategorySerializer,
    BlogCommentSerializer,
    BlogCommentCreateSerializer,
    AuthorSerializer,
    BlogTagSerializer
)

logger = logging.getLogger(__name__)


class BlogPagination(PageNumberPagination):
    page_size = 9
    page_size_query_param = 'page_size'
    max_page_size = 100


# ─────────────────────────────────────────────
#  PUBLIC  ENDPOINTS
# ─────────────────────────────────────────────

class BlogCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """List all blog categories."""
    queryset = BlogCategory.objects.all()
    serializer_class = BlogCategorySerializer
    permission_classes = [AllowAny]
    authentication_classes = []


class PublicBlogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public blog endpoints. Only returns 'published' posts (and checks scheduled dates).
    """
    permission_classes = [AllowAny]
    authentication_classes = []
    pagination_class = BlogPagination
    lookup_field = 'slug'

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return BlogPostDetailSerializer
        return BlogPostListSerializer

    def get_queryset(self):
        # Base: must be published and the publish date must be in the past
        qs = BlogPost.objects.filter(
            status='published',
            published_at__lte=timezone.now()
        ).select_related('category', 'author').prefetch_related('tags')

        # Search
        search = self.request.query_params.get('search', '')
        if search:
            qs = qs.filter(
                Q(title__icontains=search) |
                Q(excerpt__icontains=search) |
                Q(tags__name__icontains=search) |
                Q(category__name__icontains=search)
            ).distinct()

        # Category filter (by slug)
        category = self.request.query_params.get('category', '')
        if category:
            qs = qs.filter(category__slug=category)

        # Tag filter
        tag = self.request.query_params.get('tag', '')
        if tag:
            qs = qs.filter(tags__slug=tag)

        # Author filter
        author = self.request.query_params.get('author', '')
        if author:
            qs = qs.filter(author__id=author)

        return qs.order_by('-published_at', '-created_at')

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        BlogPost.objects.filter(pk=instance.pk).update(views_count=instance.views_count + 1)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def featured(self, request):
        posts = self.get_queryset().filter(is_featured=True)[:5]
        return Response(BlogPostListSerializer(posts, many=True).data)
        
    @action(detail=False, methods=['get'])
    def trending(self, request):
        posts = self.get_queryset().filter(is_trending=True)[:5]
        return Response(BlogPostListSerializer(posts, many=True).data)

    @action(detail=False, methods=['get'])
    def related(self, request):
        slug = request.query_params.get('exclude', '')
        category_slug = request.query_params.get('category', '')
        qs = self.get_queryset().exclude(slug=slug)
        if category_slug:
            qs = qs.filter(category__slug=category_slug)
        return Response(BlogPostListSerializer(qs[:4], many=True).data)

    @action(detail=True, methods=['post'])
    def like(self, request, slug=None):
        post = self.get_object()
        BlogPost.objects.filter(pk=post.pk).update(likes_count=post.likes_count + 1)
        return Response({'likes_count': post.likes_count + 1})

    @action(detail=True, methods=['post'])
    def comment(self, request, slug=None):
        post = self.get_object()
        serializer = BlogCommentCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(post=post, status='pending')
            return Response({'message': 'Comment submitted and awaiting approval.'}, status=201)
        return Response(serializer.errors, status=400)


# ─────────────────────────────────────────────
#  ADMIN ENDPOINTS  (IsAdminUser + JWT)
# ─────────────────────────────────────────────

class AdminBlogViewSet(viewsets.ModelViewSet):
    """Full CRUD for blog posts — admin only."""
    queryset = BlogPost.objects.all().select_related('category', 'author').prefetch_related('tags').order_by('-created_at')
    serializer_class = BlogPostAdminSerializer
    permission_classes = [IsAdminUser]
    authentication_classes = [JWTAuthentication]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'excerpt', 'author__name']

    def get_queryset(self):
        qs = super().get_queryset()
        status_filter = self.request.query_params.get('status', '')
        if status_filter:
            qs = qs.filter(status=status_filter)
        category = self.request.query_params.get('category', '')
        if category:
            qs = qs.filter(category__slug=category)
        return qs

    @action(detail=True, methods=['post'])
    def set_status(self, request, pk=None):
        post = self.get_object()
        new_status = request.data.get('status')
        if new_status in dict(BlogPost.STATUS_CHOICES):
            post.status = new_status
            if new_status == 'published' and not post.published_at:
                post.published_at = timezone.now()
            post.save()
            return Response({'status': post.status, 'id': post.id})
        return Response({"error": "Invalid status"}, status=400)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        total = BlogPost.objects.count()
        published = BlogPost.objects.filter(status='published').count()
        draft = BlogPost.objects.filter(status='draft').count()
        scheduled = BlogPost.objects.filter(status='scheduled').count()
        featured = BlogPost.objects.filter(is_featured=True).count()
        total_views = sum(BlogPost.objects.values_list('views_count', flat=True))
        return Response({
            'total': total,
            'published': published,
            'draft': draft,
            'scheduled': scheduled,
            'featured': featured,
            'total_views': total_views,
        })


class AdminBlogCategoryViewSet(viewsets.ModelViewSet):
    queryset = BlogCategory.objects.all()
    serializer_class = BlogCategorySerializer
    permission_classes = [IsAdminUser]
    authentication_classes = [JWTAuthentication]


class AdminAuthorViewSet(viewsets.ModelViewSet):
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer
    permission_classes = [IsAdminUser]
    authentication_classes = [JWTAuthentication]


class AdminBlogTagViewSet(viewsets.ModelViewSet):
    queryset = BlogTag.objects.all()
    serializer_class = BlogTagSerializer
    permission_classes = [IsAdminUser]
    authentication_classes = [JWTAuthentication]


class AdminBlogCommentViewSet(viewsets.ModelViewSet):
    queryset = BlogComment.objects.all().select_related('post').order_by('-created_at')
    serializer_class = BlogCommentSerializer
    permission_classes = [IsAdminUser]
    authentication_classes = [JWTAuthentication]

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        comment = self.get_object()
        new_status = request.data.get('status')
        if new_status in dict(BlogComment.STATUS_CHOICES):
            comment.status = new_status
            comment.save()
            return Response({'status': comment.status})
        return Response({"error": "Invalid status"}, status=400)
