from django.db import models


class Vendor(models.Model):
    """Junkyard/Auto parts vendor model"""
    name = models.CharField(max_length=255)
    address = models.CharField(max_length=500)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=50)
    zipcode = models.CharField(max_length=20)
    description = models.TextField(blank=True)
    review_snippet = models.TextField(blank=True)
    rating = models.CharField(max_length=20, default="100%")
    profile_url = models.CharField(max_length=255)
    logo = models.CharField(max_length=255, default="/images/logo-placeholder.png")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['id']  # Order by ID for consistent display
        indexes = [
            models.Index(fields=['state']),
            models.Index(fields=['city']),
            models.Index(fields=['zipcode']),
        ]

    def __str__(self):
        return f"{self.name} - {self.city}, {self.state}"
