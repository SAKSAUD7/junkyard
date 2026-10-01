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
    options = models.CharField(max_length=500, blank=True, default='')  # e.g., "Night Vision, Adaptive Cruise"
    hollander_number = models.CharField(max_length=50, blank=True, default='')  # e.g., "100-10138A"
    hollander_candidates = models.JSONField(blank=True, default=list, help_text="All candidate HNs when exact resolution not possible")  # e.g., ["100-10138A", "100-10138B"]
    
    # Contact Info
    name = models.CharField(max_length=100, default='')
    email = models.EmailField(max_length=100, default='')
    phone = models.CharField(max_length=20, default='')
    
    # NEW: Separate state and zip fields
    state = models.CharField(max_length=2, blank=True, default='')  # Two-letter state code
    zip = models.CharField(max_length=10, blank=True, default='')  # ZIP code
    
    # Legacy location field (kept for backwards compatibility)
    location = models.CharField(max_length=20, default='', blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new', db_index=True)
    
    # NEW: Lead Type for separate forms
    LEAD_TYPE_CHOICES = [
        ('quality_auto_parts', 'Quality Auto Parts'),
        ('vendor', 'Junkyard Vendor'),
    ]
    lead_type = models.CharField(max_length=50, choices=LEAD_TYPE_CHOICES, default='quality_auto_parts')
    
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Email notification tracking to prevent duplicates
    notification_sent = models.BooleanField(default=False, help_text="Whether email notification has been sent")
    
    # NEW: Link lead to specific vendor (Admin usage)
    vendor = models.ForeignKey('hollander.Vendor', on_delete=models.SET_NULL, null=True, blank=True, related_name='leads', help_text="Assigned vendor")
    
    # REMOVED: assigned_vendors field - leads should NOT be assigned to vendors
    # Leads are only stored in database and emailed to admin

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

class VehicleSubmission(models.Model):
    """
    Model for the multi-step "Sell Your Car" form.
    Captures highly detailed vehicle status including VIN, Condition, Drivable status, etc.
    """
    STATUS_CHOICES = [
        ('new', 'New'),
        ('evaluating', 'Evaluating'),
        ('offer_sent', 'Offer Sent'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]

    # Vehicle Identification
    vin = models.CharField(max_length=17, blank=True, default='')
    year = models.IntegerField()
    make = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    trim = models.CharField(max_length=100, blank=True, default='')
    
    # Vehicle Condition (from multi-step form)
    mileage = models.CharField(max_length=50, blank=True, default='') # Can be exact or range
    drivable = models.BooleanField(default=False)
    starts = models.BooleanField(default=True)
    transportation_required = models.BooleanField(default=False)
    has_title = models.BooleanField(default=False)
    has_keys = models.BooleanField(default=False)
    has_all_tires = models.BooleanField(default=False)
    body_damage = models.CharField(max_length=100, blank=True, default='None')
    engine_issue = models.BooleanField(default=False)
    transmission_issue = models.BooleanField(default=False)
    
    # Seller / Contact Information
    name = models.CharField(max_length=100)
    email = models.EmailField(max_length=100)
    phone = models.CharField(max_length=20)
    zip_code = models.CharField(max_length=15)
    state = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Vehicle Submission"
        verbose_name_plural = "Vehicle Submissions"

    def __str__(self):
        return f"Sell Car: {self.year} {self.make} {self.model} - {self.name}"


class LeadDistribution(models.Model):
    """
    Freemium lead monetization junction model.

    When admin assigns a Lead to one or more vendors:
      - Vendor sees the lead SUMMARY (vehicle info, part, ZIP region) for free.
      - To see full contact details (name, phone, email) the vendor must unlock
        by paying a per-lead fee OR via an active subscription (handled in billing).
      - Admin controls distribution; vendors cannot self-assign leads.
    """
    lead = models.ForeignKey(
        'leads.Lead',
        on_delete=models.CASCADE,
        related_name='distributions',
    )
    vendor = models.ForeignKey(
        'hollander.Vendor',
        on_delete=models.CASCADE,
        related_name='lead_distributions',
    )

    # Unlock tracking
    is_unlocked = models.BooleanField(default=False, help_text="True when vendor has paid to see full contact info")
    unlocked_at = models.DateTimeField(null=True, blank=True)
    price_paid = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True, help_text="USD amount collected to unlock this lead")

    # Teaser email tracking
    teaser_email_sent = models.BooleanField(default=False, help_text="Whether the 'new lead assigned' teaser email was sent")
    teaser_email_sent_at = models.DateTimeField(null=True, blank=True)

    assigned_at = models.DateTimeField(auto_now_add=True)
    assigned_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='lead_distributions_assigned',
        help_text="Admin user who assigned this lead",
    )

    class Meta:
        ordering = ['-assigned_at']
        unique_together = [('lead', 'vendor')]
        verbose_name = "Lead Distribution"
        verbose_name_plural = "Lead Distributions"

    def __str__(self):
        status = "Unlocked" if self.is_unlocked else "Locked"
        return f"Lead #{self.lead_id} → {self.vendor} [{status}]"
