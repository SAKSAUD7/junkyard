from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class VendorInventory(models.Model):
    """Tracks Makes, Models, Parts, and Years supported by each vendor"""
    
    ITEM_TYPE_CHOICES = [
        ('make', 'Make'),
        ('model', 'Model'),
        ('part', 'Part'),
    ]
    
    vendor = models.ForeignKey('vendors.Vendor', on_delete=models.CASCADE, related_name='inventory_items')
    item_type = models.CharField(max_length=10, choices=ITEM_TYPE_CHOICES)
    
    # Hierarchical structure
    make = models.CharField(max_length=100, blank=True)  # For all types
    model = models.CharField(max_length=100, blank=True)  # For model and part types
    part_name = models.CharField(max_length=200, blank=True)  # For part type only
    
    # Year range support
    year_start = models.IntegerField(
        null=True, 
        blank=True,
        validators=[MinValueValidator(1900), MaxValueValidator(2100)]
    )
    year_end = models.IntegerField(
        null=True, 
        blank=True,
        validators=[MinValueValidator(1900), MaxValueValidator(2100)]
    )
    
    # Availability
    is_available = models.BooleanField(default=True)
    
    # Metadata
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'vendor_inventory'
        ordering = ['make', 'model', 'part_name']
        indexes = [
            models.Index(fields=['vendor', 'item_type']),
            models.Index(fields=['make']),
            models.Index(fields=['is_available']),
        ]
    
    def __str__(self):
        if self.item_type == 'make':
            return f"{self.vendor.name} - {self.make}"
        elif self.item_type == 'model':
            return f"{self.vendor.name} - {self.make} {self.model}"
        else:
            return f"{self.vendor.name} - {self.make} {self.model} - {self.part_name}"


class VendorNotification(models.Model):
    """In-app notifications for vendors"""
    
    NOTIFICATION_TYPE_CHOICES = [
        ('new_lead', 'New Lead'),
        ('lead_update', 'Lead Update'),
        ('system', 'System Notification'),
        ('account', 'Account Notification'),
    ]
    
    vendor = models.ForeignKey('vendors.Vendor', on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPE_CHOICES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    
    # Optional link to related object
    lead = models.ForeignKey('leads.Lead', on_delete=models.CASCADE, null=True, blank=True)
    
    # Status
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'vendor_notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['vendor', 'is_read']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.vendor.name} - {self.title}"


class VendorBusinessHours(models.Model):
    """Business hours for each vendor"""
    
    DAY_CHOICES = [
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
        (5, 'Saturday'),
        (6, 'Sunday'),
    ]
    
    vendor = models.ForeignKey('vendors.Vendor', on_delete=models.CASCADE, related_name='business_hours')
    day_of_week = models.IntegerField(choices=DAY_CHOICES)
    
    is_open = models.BooleanField(default=True)
    open_time = models.TimeField(null=True, blank=True)
    close_time = models.TimeField(null=True, blank=True)
    
    # Special notes (e.g., "Closed for lunch 12-1pm")
    notes = models.CharField(max_length=200, blank=True)
    
    class Meta:
        db_table = 'vendor_business_hours'
        ordering = ['vendor', 'day_of_week']
        unique_together = ['vendor', 'day_of_week']
    
    def __str__(self):
        day_name = dict(self.DAY_CHOICES)[self.day_of_week]
        if not self.is_open:
            return f"{self.vendor.name} - {day_name}: Closed"
        return f"{self.vendor.name} - {day_name}: {self.open_time} - {self.close_time}"
