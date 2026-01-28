"""
Utility functions for lead assignment to vendors
"""

from apps.hollander.models import Vendor


def assign_lead_to_vendors(lead):
    """
    Auto-assign lead to relevant vendors.
    
    For now: assigns to all active vendors
    TODO: Implement smart matching based on:
    - Location (state/zip proximity)
    - Inventory match (make/model/part availability)
    - Vendor preferences
    """
    active_vendors = Vendor.objects.filter(is_active=True)
    lead.assigned_vendors.set(active_vendors)
    
    return active_vendors.count()


def assign_lead_by_location(lead):
    """
    Assign lead to vendors in the same state
    """
    if not lead.state:
        return assign_lead_to_vendors(lead)
    
    vendors = Vendor.objects.filter(
        is_active=True,
        state=lead.state
    )
    
    if vendors.exists():
        lead.assigned_vendors.set(vendors)
        return vendors.count()
    else:
        # Fallback to all active vendors if no state match
        return assign_lead_to_vendors(lead)


def assign_lead_by_inventory(lead):
    """
    Assign lead to vendors with matching inventory
    """
    from apps.vendor_portal.models import VendorInventory
    
    # Find vendors with matching make/model
    matching_inventory = VendorInventory.objects.filter(
        make__iexact=lead.make,
        model__iexact=lead.model,
        is_available=True
    ).values_list('vendor_id', flat=True).distinct()
    
    if matching_inventory:
        vendors = Vendor.objects.filter(
            id__in=matching_inventory,
            is_active=True
        )
        lead.assigned_vendors.set(vendors)
        return vendors.count()
    else:
        # Fallback to location-based assignment
        return assign_lead_by_location(lead)

from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)

def send_lead_notification(lead):
    """
    Send email notification to admin/staff when a new lead is received
    Uses HTML template if available
    """
    subject = f"New Lead: {lead.year} {lead.make} {lead.model} ({lead.part})"
    
    # Prepare context for templates
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@junkyard.com')
    to_email = getattr(settings, 'LEAD_NOTIFICATION_EMAIL', None)
    
    context = {
        'lead': lead,
        'from_email': from_email,
        'sent_date': timezone.now().strftime('%Y-%m-%d %H:%M:%S'),
        'subject': subject
    }

    try:
        # Load templates
        html_message = render_to_string('emails/lead_notification.html', context)
        try:
            plain_message = render_to_string('emails/lead_notification.txt', context)
        except:
            # Fallback plain text if txt template missing
            plain_message = f"New Lead Received: {lead.year} {lead.make} {lead.model}"
        
        if not to_email:
            logger.warning("LEAD_NOTIFICATION_EMAIL not set in settings. Skipping email.")
            return False
            
        send_mail(
            subject,
            plain_message,
            from_email,
            [to_email],
            html_message=html_message,
            fail_silently=False,
        )
        logger.info(f"Notification email sent to {to_email} for Lead #{lead.id}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email for Lead #{lead.id}: {str(e)}")
        # Print to console for visibility during dev
        print(f"!!! EMAIL ERROR: {str(e)}")
        return False
