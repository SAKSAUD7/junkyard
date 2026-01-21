"""
Django signals for lead assignment
"""

from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Lead
from .utils import assign_lead_to_vendors


@receiver(post_save, sender=Lead)
def auto_assign_lead_to_vendors(sender, instance, created, **kwargs):
    """
    Automatically assign newly created leads to relevant vendors
    """
    if created:
        # Auto-assign to all active vendors
        vendor_count = assign_lead_to_vendors(instance)
        print(f"[OK] Auto-assigned lead #{instance.id} to {vendor_count} vendor(s)")
