from django.db import models


class Lead(models.Model):
    """Lead form submission model"""
    STATUS_CHOICES = [
        ('new', 'New'),
        ('contacted', 'Contacted'),
        ('converted', 'Converted'),
        ('closed', 'Closed'),
    ]

    # Vehicle Info
    make = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    year = models.IntegerField()
    part = models.CharField(max_length=100)
    
    # NEW: Part specifications and Hollander number
    options = models.CharField(max_length=200, blank=True, default='')  # e.g., "62 Amp"
    hollander_number = models.CharField(max_length=50, blank=True, default='')  # e.g., "601-00181"
    
    # Contact Info
    name = models.CharField(max_length=100, default='')
    email = models.EmailField(max_length=100, default='')
    phone = models.CharField(max_length=20, default='')
    
    # NEW: Separate state and zip fields
    state = models.CharField(max_length=2, blank=True, default='')  # Two-letter state code
    zip = models.CharField(max_length=10, blank=True, default='')  # ZIP code
    
    # Legacy location field (kept for backwards compatibility)
    location = models.CharField(max_length=20, default='', blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    
    # NEW: Lead Type for separate forms
    LEAD_TYPE_CHOICES = [
        ('quality_auto_parts', 'Quality Auto Parts'),
        ('vendor', 'Junkyard Vendor'),
    ]
    lead_type = models.CharField(max_length=50, choices=LEAD_TYPE_CHOICES, default='quality_auto_parts')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Email notification tracking to prevent duplicates
    notification_sent = models.BooleanField(default=False, help_text="Whether email notification has been sent")
    
    # Vendor Assignment - NEW for Vendor Portal
    assigned_vendors = models.ManyToManyField(
        'hollander.Vendor',
        related_name='assigned_leads',
        blank=True,
        help_text="Vendors this lead is assigned to"
    )

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.year} {self.make} {self.model} - {self.part}"

class VendorLead(models.Model):
    """
    Separate model for Junkyard Vendor leads.
    Stores leads from the 'Junkyard Vendors' form tab.
    """
    STATUS_CHOICES = [
        ('new', 'New'),
        ('contacted', 'Contacted'),
        ('converted', 'Converted'),
        ('closed', 'Closed'),
    ]

    # Vehicle Info (No Part or Hollander needed)
    make = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    year = models.IntegerField()
    
    # Contact Info
    name = models.CharField(max_length=100)
    email = models.EmailField(max_length=100)
    phone = models.CharField(max_length=20)
    state = models.CharField(max_length=2)
    zip = models.CharField(max_length=10)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Vendor Lead"
        verbose_name_plural = "Vendor Leads"

    def __str__(self):
        return f"Vendor Inquiry: {self.year} {self.make} {self.model} - {self.name}"
