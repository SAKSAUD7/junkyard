from django.db import models
from django.utils import timezone

class Advertisement(models.Model):
    SLOT_CHOICES = (
        ('left_sidebar_ad', 'Left Sidebar Ad'),
        ('right_sidebar_ad', 'Right Sidebar Ad'),
    )

    PAGE_CHOICES = (
        ('all', 'All Pages'),
        ('home', 'Home Page'),
        ('vendors', 'Vendors Page'),
        ('browse', 'Browse Page'),
    )

    title = models.CharField(max_length=255)
    slot = models.CharField(max_length=50, choices=SLOT_CHOICES)
    page = models.CharField(max_length=50, choices=PAGE_CHOICES, default='all', help_text="Select which page this ad appears on")
    image = models.ImageField(upload_to='ads/')
    redirect_url = models.URLField(help_text="URL to redirect to when clicked")
    
    # Template customization
    TEMPLATE_CHOICES = (
        ('standard', 'Standard Template'),
        ('minimal', 'Minimal Template'),
        ('premium', 'Premium Template'),
        ('compact', 'Compact Template'),
    )
    template_type = models.CharField(
        max_length=20, 
        choices=TEMPLATE_CHOICES, 
        default='standard',
        help_text="Choose the visual style for this ad"
    )
    button_text = models.CharField(
        max_length=50, 
        default='Visit Website', 
        blank=True,
        help_text="Custom text for the main button"
    )
    show_badge = models.BooleanField(
        default=True,
        help_text="Show 'Featured' badge at top of ad"
    )
    
    start_date = models.DateField(default=timezone.now)
    end_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    priority = models.IntegerField(default=0, help_text="Higher number = higher priority")
    
    # Analytics
    clicks = models.PositiveIntegerField(default=0)
    impressions = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-priority', '-created_at']

    def __str__(self):
        return f"{self.title} ({self.get_slot_display()})"
