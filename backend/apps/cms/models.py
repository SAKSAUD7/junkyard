from django.db import models
from django.conf import settings


class SiteContent(models.Model):
    """
    Flexible key-value CMS store.
    Keyed by (page, section, key) — e.g. ("home", "hero", "heading").
    """
    CONTENT_TYPE_CHOICES = [
        ('text', 'Plain Text'),
        ('textarea', 'Long Text / Paragraph'),
        ('html', 'HTML'),
        ('url', 'URL / Link'),
        ('boolean', 'Boolean (visible/hidden)'),
        ('image', 'Image URL'),
        ('json', 'JSON Array'),
    ]

    PAGE_CHOICES = [
        ('home', 'Home'),
        ('about', 'About'),
        ('contact', 'Contact'),
        ('browse', 'Browse States'),
        ('blog', 'Blog'),
        ('vendors', 'Vendors Listing'),
        ('faq', 'FAQ'),
        ('how_it_works', 'How It Works'),
        ('navbar', 'Navbar (Global)'),
        ('footer', 'Footer (Global)'),
        ('global', 'Global / Shared'),
        ('add_a_yard', 'Add a Yard'),
        ('vendor_portal', 'Vendor Portal'),
        ('seo_home', 'SEO – Home'),
        ('seo_about', 'SEO – About'),
        ('seo_contact', 'SEO – Contact'),
        ('seo_browse', 'SEO – Browse'),
        ('seo_blog', 'SEO – Blog'),
        ('seo_vendors', 'SEO – Vendors'),
    ]

    page = models.CharField(max_length=60, choices=PAGE_CHOICES, db_index=True)
    section = models.CharField(max_length=100, db_index=True)
    key = models.CharField(max_length=100)
    value = models.TextField(blank=True, default='')
    content_type = models.CharField(max_length=20, choices=CONTENT_TYPE_CHOICES, default='text')
    label = models.CharField(max_length=200, blank=True, help_text='Human-readable label for the CMS UI')
    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='cms_updates'
    )

    class Meta:
        db_table = 'cms_site_content'
        unique_together = [('page', 'section', 'key')]
        ordering = ['page', 'section', 'key']
        verbose_name = 'Site Content'
        verbose_name_plural = 'Site Content'

    def __str__(self):
        return f"{self.page} › {self.section} › {self.key}"


class MediaAsset(models.Model):
    """Track uploaded media assets for the CMS media manager."""
    name = models.CharField(max_length=255)
    file = models.ImageField(upload_to='cms/media/', blank=True)
    url = models.URLField(max_length=500, blank=True, help_text='External URL if hosted on Azure/CDN')
    alt_text = models.CharField(max_length=255, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='media_uploads'
    )

    class Meta:
        db_table = 'cms_media_assets'
        ordering = ['-uploaded_at']

    def __str__(self):
        return self.name

    @property
    def resolved_url(self):
        if self.url:
            return self.url
        if self.file:
            return self.file.url
        return ''
