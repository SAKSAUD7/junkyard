from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """Custom user model with additional fields"""
    
    USER_TYPE_CHOICES = [
        ('customer', 'Customer'),
        ('vendor', 'Vendor'),
        ('admin', 'Admin'),
    ]
    
    email = models.EmailField(unique=True)
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='customer')
    phone = models.CharField(max_length=20, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    email_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Make email the primary login field
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    class Meta:
        db_table = 'users'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.email


class VendorProfile(models.Model):
    """Link users to vendors for dashboard access"""
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='vendor_profile')
    vendor = models.ForeignKey('vendors.Vendor', on_delete=models.CASCADE, related_name='profiles')
    is_owner = models.BooleanField(default=False)
    can_edit = models.BooleanField(default=True)
    can_respond_reviews = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'vendor_profiles'
        unique_together = ['user', 'vendor']
    
    def __str__(self):
        return f"{self.user.email} - {self.vendor.name}"
