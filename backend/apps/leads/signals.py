"""
Django signals for lead assignment
"""

from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Lead
from .utils import assign_lead_to_vendors, send_lead_notification


@receiver(post_save, sender=Lead, dispatch_uid="lead_post_save_email_notification")
def auto_assign_lead_to_vendors(sender, instance, created, **kwargs):
    """
    Handle new lead creation:
    1. Send email notification to Admin (ALWAYS)
    2. Do NOT assign to vendors automatically (per user request)
    """
    if created:
        # Send Email Notification to Admin
        email_sent = send_lead_notification(instance)
        if email_sent:
            print(f"[OK] Notification email sent for Lead #{instance.id}")
        else:
            print(f"[WARN] Notification email failed for Lead #{instance.id}")
            
        # NOTE: Auto-assignment to vendors is DISABLED for 'quality_auto_parts' leads.
        # They are stored in DB and emailed to Admin only.

