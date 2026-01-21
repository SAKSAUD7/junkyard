"""
Django signals for vendor portal notifications
"""

from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.leads.models import Lead, VendorLead
from apps.vendor_portal.notifications import send_new_lead_notification
from apps.vendor_portal.models import VendorNotification


import threading

@receiver(post_save, sender=Lead)
def notify_vendors_on_new_lead(sender, instance, created, **kwargs):
    """
    Send notifications to relevant vendors when a new lead is created
    """
    if created:
        # Get vendors that match the lead criteria
        # For now, notify all active vendors
        # TODO: Implement smart matching based on inventory
        from apps.hollander.models import Vendor
        
        active_vendors = Vendor.objects.filter(is_active=True)
        
        if active_vendors.exists():
            # Use threading to send emails asynchronously so we don't block the response
            print(f"[INFO] Lead #{instance.id} created. Starting email thread for {active_vendors.count()} vendors...")
            email_thread = threading.Thread(
                target=send_new_lead_notification,
                args=(instance, active_vendors)
            )
            email_thread.start()
        else:
            print(f"[INFO] Lead #{instance.id} created. No active vendors to notify.")


@receiver(post_save, sender=VendorLead)
def notify_vendors_on_new_vendor_lead(sender, instance, created, **kwargs):
    """
    Send notifications to vendors when a new vendor lead is created.
    Only notifies vendors in the SAME STATE as the lead and who are ACTIVE.
    """
    if created:
        from apps.hollander.models import Vendor
        
        # Filter vendors by state AND active status
        matching_vendors = Vendor.objects.filter(
            state__iexact=instance.state,  # Case-insensitive state match
            is_active=True
        )
        
        if matching_vendors.exists():
            print(f"[INFO] VendorLead #{instance.id} created for state '{instance.state}'. "
                  f"Notifying {matching_vendors.count()} active vendors in that state...")
            
            # Create in-app notifications for each matching vendor
            for vendor in matching_vendors:
                VendorNotification.objects.create(
                    vendor=vendor,
                    notification_type='new_lead',
                    title=f'New Lead: {instance.year} {instance.make} {instance.model}',
                    message=f'A customer in {instance.state} is looking for a {instance.year} {instance.make} {instance.model}. '
                            f'Contact: {instance.name} ({instance.phone})',
                    vendor_lead=instance
                )
            
            # Send email notifications asynchronously
            email_thread = threading.Thread(
                target=send_new_lead_notification,
                args=(instance, matching_vendors)
            )
            email_thread.start()
        else:
            print(f"[INFO] VendorLead #{instance.id} created for state '{instance.state}'. "
                  f"No active vendors found in that state.")
