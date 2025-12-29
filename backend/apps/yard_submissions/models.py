from django.db import models
from django.utils import timezone


class YardSubmission(models.Model):
    """Public yard submission model for marketplace expansion"""
    
    STATUS_CHOICES = (
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )
    
    PLAN_CHOICES = (
        ('standard', 'Standard Plan - Basic Listing'),
        ('minimal', 'Minimal Plan - Clean & Simple'),
        ('premium', 'Premium Plan - Featured Listing'),
        ('compact', 'Compact Plan - Quick View'),
    )
    
    # Business Information
    business_name = models.CharField(max_length=255, help_text="Junkyard/Business name")
    contact_name = models.CharField(max_length=255, help_text="Primary contact person")
    email = models.EmailField(help_text="Contact email")
    phone = models.CharField(max_length=20, help_text="Local phone number")
    toll_free = models.CharField(max_length=20, blank=True, help_text="Toll free number")
    fax = models.CharField(max_length=20, blank=True, help_text="Fax number")
    website = models.URLField(blank=True, help_text="Business website (optional)")
    
    # Location
    address = models.CharField(max_length=500, help_text="Street address")
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=50)
    zip_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100, default="United States")
    
    # Business Owner
    owner_first_name = models.CharField(max_length=100, blank=True)
    owner_last_name = models.CharField(max_length=100, blank=True)
    owner_phone = models.CharField(max_length=20, blank=True)
    owner_email = models.EmailField(blank=True)
    
    # Payment Methods (stored as JSON array)
    payment_methods = models.JSONField(default=list, blank=True, help_text="Accepted payment methods")
    
    # Business Hours (stored as JSON object)
    business_hours = models.JSONField(default=dict, blank=True, help_text="Business hours by day")
    
    # Business Details
    services = models.TextField(help_text="Services offered (e.g., Auto parts, Towing, Recycling)")
    brands = models.TextField(help_text="Vehicle makes/brands serviced")
    parts_categories = models.TextField(blank=True, help_text="Types of parts available")
    description = models.TextField(help_text="Business description")
    
    # Subscription Plan
    subscription_plan = models.CharField(
        max_length=20, 
        choices=PLAN_CHOICES, 
        default='standard',
        help_text="Selected advertising plan"
    )
    
    # Media
    logo = models.ImageField(upload_to='submissions/logos/', blank=True, null=True, help_text="Business logo")
    images = models.JSONField(default=list, blank=True, help_text="Additional yard images (paths)")
    
    # Status & Tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    admin_notes = models.TextField(blank=True, help_text="Internal admin notes")
    created_vendor = models.ForeignKey(
        'vendors.Vendor', 
        null=True, 
        blank=True, 
        on_delete=models.SET_NULL,
        related_name='submission',
        help_text="Vendor created from this submission"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    reviewed_at = models.DateTimeField(null=True, blank=True, help_text="When admin reviewed")
    reviewed_by = models.CharField(max_length=255, blank=True, help_text="Admin who reviewed")
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Yard Submission"
        verbose_name_plural = "Yard Submissions"
        indexes = [
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['email']),
            models.Index(fields=['zip_code']),
        ]
    
    def __str__(self):
        return f"{self.business_name} - {self.city}, {self.state} ({self.get_status_display()})"
    
    def mark_as_approved(self, admin_user=None):
        """Mark submission as approved"""
        self.status = 'approved'
        self.reviewed_at = timezone.now()
        if admin_user:
            self.reviewed_by = admin_user
        self.save()
    
    def mark_as_rejected(self, admin_user=None, notes=''):
        """Mark submission as rejected"""
        self.status = 'rejected'
        self.reviewed_at = timezone.now()
        if admin_user:
            self.reviewed_by = admin_user
        if notes:
            self.admin_notes = notes
        self.save()
