"""
Email notification utility for sending vendor notifications
"""

from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from apps.vendor_portal.models import VendorNotification


def send_new_lead_notification(lead, vendors):
    """
    Send email notification to vendors when a new lead is created
    
    Args:
        lead: Lead instance
        vendors: List of Vendor instances to notify
    """
    for vendor in vendors:
        try:
            # Create in-app notification
            notification = VendorNotification.objects.create(
                vendor=vendor,
                notification_type='new_lead',
                title=f'New Lead: {lead.year} {lead.make} {lead.model}',
                message=f'You have a new lead request for {lead.part}. Customer: {lead.name} ({lead.email})',
                lead=lead
            )
            
            # Send email notification
            subject = f'New Lead Request - {lead.year} {lead.make} {lead.model}'
            
            # Get vendor email from vendor profile users
            vendor_emails = []
            for profile in vendor.profiles.all():
                if profile.user.email:
                    vendor_emails.append(profile.user.email)
            
            if not vendor_emails:
                print(f"No email addresses found for vendor: {vendor.name}")
                continue
            
            # Email content
            message = f"""
New Lead Request

Vehicle Information:
- Year: {lead.year}
- Make: {lead.make}
- Model: {lead.model}
- Part: {lead.part}
{f'- Options: {lead.options}' if lead.options else ''}
{f'- Hollander Number: {lead.hollander_number}' if lead.hollander_number else ''}

Customer Information:
- Name: {lead.name}
- Email: {lead.email}
- Phone: {lead.phone}
- Location: {lead.state}, {lead.zip if lead.zip else lead.location}

Lead ID: #{lead.id}
Created: {lead.created_at.strftime('%Y-%m-%d %H:%M')}

Login to your vendor portal to respond:
{settings.SITE_URL}/vendor/login

View lead details:
{settings.SITE_URL}/vendor/leads/{lead.id}

---
JYNM Vendor Portal
            """
            
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=vendor_emails,
                fail_silently=False,
            )
            
            print(f"✓ Email sent to {vendor.name} ({', '.join(vendor_emails)})")
            
        except Exception as e:
            print(f"✗ Failed to send notification to {vendor.name}: {str(e)}")


def send_lead_status_update_notification(lead, vendor, old_status, new_status):
    """
    Send notification when lead status is updated
    
    Args:
        lead: Lead instance
        vendor: Vendor instance
        old_status: Previous status
        new_status: New status
    """
    try:
        # Create in-app notification
        VendorNotification.objects.create(
            vendor=vendor,
            notification_type='lead_update',
            title=f'Lead Status Updated: #{lead.id}',
            message=f'Lead status changed from {old_status} to {new_status}',
            lead=lead
        )
        
        print(f"✓ Status update notification created for {vendor.name}")
        
    except Exception as e:
        print(f"✗ Failed to create status update notification: {str(e)}")


def send_system_notification(vendor, title, message):
    """
    Send system notification to vendor
    
    Args:
        vendor: Vendor instance
        title: Notification title
        message: Notification message
    """
    try:
        VendorNotification.objects.create(
            vendor=vendor,
            notification_type='system',
            title=title,
            message=message
        )
        
        print(f"✓ System notification created for {vendor.name}")
        
    except Exception as e:
        print(f"✗ Failed to create system notification: {str(e)}")
