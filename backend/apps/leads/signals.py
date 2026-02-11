"""
Django signals for lead assignment
"""

from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Lead
from .utils import send_lead_notification


@receiver(post_save, sender=Lead, dispatch_uid="lead_post_save_email_notification")
def auto_assign_lead_to_vendors(sender, instance, created, **kwargs):
    """
    Handle new lead creation:
    1. Send email notification to Admin (ALWAYS)
    2. Do NOT assign to vendors automatically (per user request)
    """
    print(f"========== SIGNAL TRIGGERED ==========")
    print(f"Lead ID: {instance.id}")
    print(f"Created: {created}")
    print(f"Notification Sent Flag: {instance.notification_sent}")
    print(f"======================================")
    
    if created and not instance.notification_sent:
        # Send Email Notification to Admin
        print(f"[SENDING EMAIL] Attempting to send email for Lead #{instance.id}")
        email_sent = send_lead_notification(instance)
        if email_sent:
            # Mark as sent to prevent duplicates
            Lead.objects.filter(pk=instance.pk).update(notification_sent=True)
            print(f"[OK] Notification email sent for Lead #{instance.id}")
        else:
            print(f"[WARN] Notification email failed for Lead #{instance.id}")
            
        # NOTE: Auto-assignment to vendors is DISABLED for 'quality_auto_parts' leads.
        # They are stored in DB and emailed to Admin only.
    else:
        print(f"[SKIP] Email already sent or not a new lead (Lead #{instance.id})")


