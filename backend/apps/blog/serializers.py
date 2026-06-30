from rest_framework import serializers
from .models import BlogPost, BlogCategory, BlogComment, Author, BlogTag


class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = '__all__'


class BlogTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogTag
        fields = '__all__'


class BlogCategorySerializer(serializers.ModelSerializer):
    post_count = serializers.SerializerMethodField()
    parent_name = serializers.CharField(source='parent.name', read_only=True, default=None)

    class Meta:
        model = BlogCategory
        fields = ['id', 'name', 'slug', 'description', 'parent', 'parent_name', 'post_count']

    def get_post_count(self, obj):
        return obj.posts.filter(status='published').count()


class BlogPostListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing pages — no full blocks."""
    category_name = serializers.CharField(source='category.name', read_only=True, default=None)
    category_slug = serializers.CharField(source='category.slug', read_only=True, default=None)
    author_info = AuthorSerializer(source='author', read_only=True)
    tags_info = BlogTagSerializer(source='tags', many=True, read_only=True)
    image_url = serializers.SerializerMethodField()

    def get_image_url(self, obj):
        return obj.thumbnail_url or obj.cover_image_url or ''

    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'excerpt',
            'thumbnail_url', 'cover_image_url', 'image_url',
            'category', 'category_name', 'category_slug',
            'author', 'author_info', 'tags_info',
            'is_featured', 'is_trending', 'is_editors_pick', 'status',
            'views_count', 'likes_count', 'reading_time',
            'published_at', 'created_at',
        ]


class BlogPostDetailSerializer(serializers.ModelSerializer):
    """Full serializer for detail page — includes blocks and comments."""
    category = BlogCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=BlogCategory.objects.all(), source='category', write_only=True,
        required=False, allow_null=True
    )
    author_info = AuthorSerializer(source='author', read_only=True)
    tags_info = BlogTagSerializer(source='tags', many=True, read_only=True)
    comments = serializers.SerializerMethodField()
    related_posts_info = BlogPostListSerializer(source='related_posts', many=True, read_only=True)

    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'excerpt', 'blocks', 'cover_image_url', 'thumbnail_url',
            'category', 'category_id', 'author', 'author_info',
            'tags', 'tags_info', 'related_posts', 'related_posts_info',
            'is_featured', 'is_trending', 'is_editors_pick', 'status',
            'seo_title', 'seo_description', 'canonical_url', 'og_image_url',
            'views_count', 'likes_count', 'reading_time', 'allow_comments',
            'published_at', 'created_at', 'updated_at', 'comments',
        ]

    def get_comments(self, obj):
        approved = obj.comments.filter(status='approved')
        return BlogCommentSerializer(approved, many=True).data


class BlogPostAdminSerializer(serializers.ModelSerializer):
    """Full serializer for Admin CRUD — handles string tags (if we want to create them on the fly)."""
    # Exposing the readable formats for the table view
    category_name = serializers.CharField(source='category.name', read_only=True, default=None)
    author_name = serializers.CharField(source='author.name', read_only=True, default=None)

    class Meta:
        model = BlogPost
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'views_count', 'likes_count', 'slug']


class BlogCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogComment
        fields = ['id', 'name', 'content', 'created_at', 'status']


class BlogCommentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogComment
        fields = ['name', 'email', 'content']
