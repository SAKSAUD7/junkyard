from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.pagination import PageNumberPagination
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.db.models import Q
from django.shortcuts import get_object_or_404
import logging

from .models import BlogPost, BlogCategory, BlogComment
from .serializers import (
    BlogPostListSerializer,
    BlogPostDetailSerializer,
    BlogPostAdminSerializer,
    BlogCategorySerializer,
    BlogCommentCreateSerializer,
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
    Public blog endpoints:
      GET /api/blog/posts/              → paginated list
      GET /api/blog/posts/featured/     → featured posts
      GET /api/blog/posts/{slug}/       → detail by slug
      POST /api/blog/posts/{slug}/view/ → increment view count
      POST /api/blog/posts/{slug}/like/ → increment like count
    """
    queryset = BlogPost.objects.filter(status='published').select_related('category')
    permission_classes = [AllowAny]
    authentication_classes = []
    pagination_class = BlogPagination
    lookup_field = 'slug'

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return BlogPostDetailSerializer
        return BlogPostListSerializer

    def get_queryset(self):
        qs = super().get_queryset()

        # Search
        search = self.request.query_params.get('search', '')
        if search:
            qs = qs.filter(
                Q(title__icontains=search) |
                Q(excerpt__icontains=search) |
                Q(content__icontains=search)
            )

        # Category filter (by slug)
        category = self.request.query_params.get('category', '')
        if category:
            qs = qs.filter(category__slug=category)

        # Tag filter
        tag = self.request.query_params.get('tag', '')
        if tag:
            qs = qs.filter(tags__contains=[tag])

        return qs.order_by('-published_at', '-created_at')

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Auto-increment view count (fire-and-forget, no race condition guarantees needed)
        BlogPost.objects.filter(pk=instance.pk).update(views_count=instance.views_count + 1)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Return up to 5 featured published posts."""
        posts = self.get_queryset().filter(is_featured=True)[:5]
        serializer = BlogPostListSerializer(posts, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def related(self, request):
        """Return related posts based on category and/or tags."""
        slug = request.query_params.get('exclude', '')
        category_slug = request.query_params.get('category', '')
        qs = self.get_queryset().exclude(slug=slug)
        if category_slug:
            qs = qs.filter(category__slug=category_slug)
        return Response(BlogPostListSerializer(qs[:4], many=True).data)

    @action(detail=True, methods=['post'])
    def like(self, request, slug=None):
        """Increment the like counter for a post."""
        post = self.get_object()
        BlogPost.objects.filter(pk=post.pk).update(likes_count=post.likes_count + 1)
        return Response({'likes_count': post.likes_count + 1})

    @action(detail=True, methods=['post'])
    def comment(self, request, slug=None):
        """Submit a comment on a post."""
        post = self.get_object()
        serializer = BlogCommentCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(post=post)
            return Response({'message': 'Comment submitted and awaiting approval.'}, status=201)
        return Response(serializer.errors, status=400)


# ─────────────────────────────────────────────
#  ADMIN ENDPOINTS  (IsAdminUser + JWT)
# ─────────────────────────────────────────────

class AdminBlogViewSet(viewsets.ModelViewSet):
    """
    Full CRUD for blog posts — admin only.
      GET    /api/blog/admin/posts/           → list all (all statuses)
      POST   /api/blog/admin/posts/           → create
      GET    /api/blog/admin/posts/{id}/      → retrieve
      PUT    /api/blog/admin/posts/{id}/      → update
      PATCH  /api/blog/admin/posts/{id}/      → partial update
      DELETE /api/blog/admin/posts/{id}/      → delete
      POST   /api/blog/admin/posts/{id}/publish/  → set to published
      POST   /api/blog/admin/posts/{id}/draft/    → set to draft
      POST   /api/blog/admin/posts/{id}/feature/  → toggle featured
    """
    queryset = BlogPost.objects.all().select_related('category').order_by('-created_at')
    serializer_class = BlogPostAdminSerializer
    permission_classes = [IsAdminUser]
    authentication_classes = [JWTAuthentication]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'author', 'excerpt']

    def get_queryset(self):
        qs = super().get_queryset()
        status_filter = self.request.query_params.get('status', '')
        if status_filter in ('draft', 'published'):
            qs = qs.filter(status=status_filter)
        category = self.request.query_params.get('category', '')
        if category:
            qs = qs.filter(category__slug=category)
        return qs

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        post = self.get_object()
        post.status = 'published'
        post.save()
        return Response({'status': 'published', 'id': post.id})

    @action(detail=True, methods=['post'])
    def draft(self, request, pk=None):
        post = self.get_object()
        post.status = 'draft'
        post.save()
        return Response({'status': 'draft', 'id': post.id})

    @action(detail=True, methods=['post'])
    def feature(self, request, pk=None):
        post = self.get_object()
        post.is_featured = not post.is_featured
        post.save()
        return Response({'is_featured': post.is_featured, 'id': post.id})

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Return high-level blog statistics for admin dashboard."""
        total = BlogPost.objects.count()
        published = BlogPost.objects.filter(status='published').count()
        draft = BlogPost.objects.filter(status='draft').count()
        featured = BlogPost.objects.filter(is_featured=True).count()
        total_views = sum(BlogPost.objects.values_list('views_count', flat=True))
        total_likes = sum(BlogPost.objects.values_list('likes_count', flat=True))
        return Response({
            'total': total,
            'published': published,
            'draft': draft,
            'featured': featured,
            'total_views': total_views,
            'total_likes': total_likes,
        })


class AdminBlogCategoryViewSet(viewsets.ModelViewSet):
    """Full CRUD for blog categories — admin only."""
    queryset = BlogCategory.objects.all()
    serializer_class = BlogCategorySerializer
    permission_classes = [IsAdminUser]
    authentication_classes = [JWTAuthentication]


class AdminBlogCommentViewSet(viewsets.ModelViewSet):
    """Manage blog comments — admin only."""
    queryset = BlogComment.objects.all().select_related('post').order_by('-created_at')
    serializer_class = BlogCommentCreateSerializer
    permission_classes = [IsAdminUser]
    authentication_classes = [JWTAuthentication]

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        comment = self.get_object()
        comment.is_approved = True
        comment.save()
        return Response({'is_approved': True})
