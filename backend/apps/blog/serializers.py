from rest_framework import serializers
from .models import BlogPost, BlogCategory, BlogComment


class BlogCategorySerializer(serializers.ModelSerializer):
    post_count = serializers.SerializerMethodField()

    class Meta:
        model = BlogCategory
        fields = ['id', 'name', 'slug', 'description', 'post_count']

    def get_post_count(self, obj):
        return obj.posts.filter(status='published').count()


class BlogPostListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing pages — no full content."""
    category_name = serializers.CharField(source='category.name', read_only=True, default=None)
    category_slug = serializers.CharField(source='category.slug', read_only=True, default=None)
    reading_time = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'excerpt', 'image_url',
            'category_name', 'category_slug', 'author', 'author_avatar_url',
            'tags', 'is_featured', 'status', 'views_count', 'likes_count',
            'published_at', 'created_at', 'reading_time',
        ]

    def get_reading_time(self, obj):
        word_count = len(str(obj.content).split())
        return max(1, round(word_count / 200))


class BlogPostDetailSerializer(serializers.ModelSerializer):
    """Full serializer for detail page — includes content and comments."""
    category = BlogCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=BlogCategory.objects.all(), source='category', write_only=True,
        required=False, allow_null=True
    )
    comments = serializers.SerializerMethodField()
    reading_time = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'excerpt', 'content', 'image_url',
            'category', 'category_id', 'author', 'author_avatar_url',
            'tags', 'is_featured', 'status',
            'meta_title', 'meta_description',
            'views_count', 'likes_count',
            'published_at', 'created_at', 'updated_at',
            'reading_time', 'comments',
        ]

    def get_comments(self, obj):
        approved = obj.comments.filter(is_approved=True)
        return BlogCommentSerializer(approved, many=True).data

    def get_reading_time(self, obj):
        word_count = len(str(obj.content).split())
        return max(1, round(word_count / 200))


class BlogPostAdminSerializer(serializers.ModelSerializer):
    """Full serializer for Admin CRUD — all fields writable."""
    category_name = serializers.CharField(source='category.name', read_only=True, default=None)

    class Meta:
        model = BlogPost
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'views_count', 'slug']

    def validate_tags(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Tags must be a list of strings.")
        return [str(t).strip() for t in value if t]


class BlogCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogComment
        fields = ['id', 'name', 'content', 'created_at']


class BlogCommentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogComment
        fields = ['name', 'email', 'content']
