"""
Django signals for vendor portal notifications
"""

from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.leads.models import Lead
from apps.vendor_portal.notifications import send_new_lead_notification


@receiver(post_save, sender=Lead)
def notify_vendors_on_new_lead(sender, instance, created, **kwargs):
    """
    Send notifications to relevant vendors when a new lead is created
    """
    if created:
        # Get vendors that match the lead criteria
        # For now, notify all active vendors
        # TODO: Implement smart matching based on inventory
        from apps.vendors.models import Vendor
        
        active_vendors = Vendor.objects.filter(is_active=True)
        
        if active_vendors.exists():
            send_new_lead_notification(instance, active_vendors)
