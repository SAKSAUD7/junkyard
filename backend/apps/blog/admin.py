from django.contrib import admin
from .models import BlogPost, BlogCategory, BlogComment


@admin.register(BlogCategory)
class BlogCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'created_at']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'category', 'status', 'is_featured', 'views_count', 'published_at']
    list_filter = ['status', 'is_featured', 'category']
    search_fields = ['title', 'author', 'excerpt']
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ['views_count', 'likes_count', 'created_at', 'updated_at']
    list_editable = ['status', 'is_featured']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    fieldsets = (
        ('Content', {'fields': ('title', 'slug', 'excerpt', 'content', 'image_url')}),
        ('Taxonomy', {'fields': ('category', 'author', 'author_avatar_url', 'tags')}),
        ('Publishing', {'fields': ('status', 'is_featured', 'published_at')}),
        ('SEO', {'fields': ('meta_title', 'meta_description')}),
        ('Stats', {'fields': ('views_count', 'likes_count', 'created_at', 'updated_at')}),
    )


@admin.register(BlogComment)
class BlogCommentAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'post', 'is_approved', 'created_at']
    list_filter = ['is_approved']
    list_editable = ['is_approved']
    search_fields = ['name', 'email', 'content']
