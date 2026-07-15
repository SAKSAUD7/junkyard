from django.db import models
from django.conf import settings

class Transaction(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='transactions')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')
    
    # Authorize.net specific fields
    transaction_id = models.CharField(max_length=255, blank=True, null=True)
    auth_code = models.CharField(max_length=100, blank=True, null=True)
    response_code = models.CharField(max_length=10, blank=True, null=True)
    full_response = models.JSONField(blank=True, null=True)

    # Reference what they bought
    item_type = models.CharField(max_length=50, blank=True, null=True) # e.g. 'ad_plan', 'yard_submission'
    item_id = models.CharField(max_length=255, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.item_type} - ${self.amount} - {self.status} (Txn: {self.transaction_id})"
