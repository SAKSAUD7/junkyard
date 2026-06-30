from django.db import models
from django.utils.text import slugify
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class Author(models.Model):
    name = models.CharField(max_length=150)
    bio = models.TextField(blank=True)
    designation = models.CharField(max_length=150, blank=True)
    profile_picture_url = models.URLField(max_length=1000, blank=True)
    website = models.URLField(max_length=1000, blank=True)
    twitter = models.URLField(max_length=1000, blank=True)
    linkedin = models.URLField(max_length=1000, blank=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class BlogCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    description = models.TextField(blank=True)
    parent = models.ForeignKey(
        'self', on_delete=models.SET_NULL, null=True, blank=True, related_name='subcategories'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Blog Category'
        verbose_name_plural = 'Blog Categories'
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class BlogTag(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)

    class Meta:
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class BlogPost(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('scheduled', 'Scheduled'),
        ('archived', 'Archived'),
    ]

    title = models.CharField(max_length=300)
    slug = models.SlugField(max_length=350, unique=True, blank=True)
    excerpt = models.TextField(max_length=500, blank=True, help_text="Short summary shown in listing cards")
    
    # Core architectural shift: JSON blocks instead of raw HTML
    blocks = models.JSONField(default=list, blank=True, help_text="Array of JSON block objects for the builder")
    
    cover_image_url = models.URLField(max_length=1000, blank=True, help_text="Hero image URL")
    thumbnail_url = models.URLField(max_length=1000, blank=True, help_text="Card image URL (defaults to cover if blank)")
    
    category = models.ForeignKey(
        BlogCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='posts'
    )
    author = models.ForeignKey(
        Author,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='posts'
    )
    tags = models.ManyToManyField(BlogTag, blank=True, related_name='posts')
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft', db_index=True)
    is_featured = models.BooleanField(default=False, db_index=True)
    is_trending = models.BooleanField(default=False, db_index=True)
    is_editors_pick = models.BooleanField(default=False, db_index=True)
    
    # SEO Panel
    seo_title = models.CharField(max_length=300, blank=True, help_text="SEO title (defaults to title)")
    seo_description = models.CharField(max_length=500, blank=True, help_text="SEO meta description")
    canonical_url = models.URLField(max_length=1000, blank=True)
    og_image_url = models.URLField(max_length=1000, blank=True)
    
    # Content Metadata
    reading_time = models.PositiveIntegerField(default=5, help_text="Estimated reading time in minutes")
    allow_comments = models.BooleanField(default=True)
    
    # Stats
    views_count = models.PositiveIntegerField(default=0)
    likes_count = models.PositiveIntegerField(default=0)
    
    # Related (Self-referential ManyToMany)
    related_posts = models.ManyToManyField('self', blank=True, symmetrical=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'Blog Post'
        verbose_name_plural = 'Blog Posts'
        ordering = ['-published_at', '-created_at']
        indexes = [
            models.Index(fields=['status', '-published_at']),
            models.Index(fields=['is_featured', 'status']),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while BlogPost.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        
        if self.status == 'published' and not self.published_at:
            self.published_at = timezone.now()
        
        if not self.seo_title:
            self.seo_title = self.title
            
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class BlogComment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('spam', 'Spam'),
    ]

    post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name='comments')
    name = models.CharField(max_length=100)
    email = models.EmailField()
    content = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Comment by {self.name} on '{self.post.title}'"
