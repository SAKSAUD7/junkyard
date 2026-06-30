from django.contrib import admin
from .models import BlogPost, BlogCategory, BlogTag, Author, BlogComment


@admin.register(Author)
class AuthorAdmin(admin.ModelAdmin):
    list_display = ['name', 'designation']
    search_fields = ['name']


@admin.register(BlogCategory)
class BlogCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'parent', 'created_at']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']
    list_filter = ['parent']


@admin.register(BlogTag)
class BlogTagAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'category', 'status', 'is_featured', 'published_at']
    list_filter = ['status', 'is_featured', 'is_trending', 'is_editors_pick', 'category']
    search_fields = ['title', 'author__name', 'excerpt']
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ['views_count', 'likes_count', 'created_at', 'updated_at']
    list_editable = ['status', 'is_featured']
    filter_horizontal = ['tags', 'related_posts']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    fieldsets = (
        ('Content', {'fields': ('title', 'slug', 'excerpt', 'blocks', 'cover_image_url', 'thumbnail_url')}),
        ('Taxonomy', {'fields': ('category', 'author', 'tags', 'related_posts')}),
        ('Publishing', {'fields': ('status', 'is_featured', 'is_trending', 'is_editors_pick', 'published_at', 'allow_comments', 'reading_time')}),
        ('SEO', {'fields': ('seo_title', 'seo_description', 'canonical_url', 'og_image_url')}),
        ('Stats', {'fields': ('views_count', 'likes_count', 'created_at', 'updated_at')}),
    )


@admin.register(BlogComment)
class BlogCommentAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'post', 'status', 'created_at']
    list_filter = ['status']
    list_editable = ['status']
    search_fields = ['name', 'email', 'content']
