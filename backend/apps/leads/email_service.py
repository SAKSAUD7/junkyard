"""
Email Service for Lead Notifications
Sends formatted emails to CRM when leads are submitted
"""
from django.core.mail import send_mail
from django.conf import settings
from datetime import datetime
import pytz
import logging

logger = logging.getLogger(__name__)


def send_lead_email(lead):
    """
    Send lead notification email to CRM in exact format
    
    Args:
        lead: Lead model instance
        
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        # Format email subject
        subject = "QAJ Lead"
        
        # Get current time in CST timezone
        cst = pytz.timezone('America/Chicago')
        now_cst = datetime.now(cst)
        timestamp = now_cst.strftime('%m/%d/%Y %I:%M %p CST')
        
        # Extract state from location if possible (simplified - assumes ZIP or State abbreviation)
        state = lead.state if hasattr(lead, 'state') and lead.state else extract_state(lead.location)
        
        # Format email body to match reference exactly
        email_body = f"""Requested Information
Mail Sent on: Mail Sent on {timestamp}

Name: {lead.name}
Email Address: {lead.email}
Phone: {lead.phone}
State: {state}
Zip: {lead.location}
Year: {lead.year}
Make: {lead.make}
Model: {lead.model}
Part: {lead.part}
Options: {getattr(lead, 'options', '')}
Hollander#: {getattr(lead, 'hollander_number', '')}"""
        
        # Get email settings from Django settings
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'sales@qualityautoparts.com')
        recipient_list = getattr(settings, 'LEAD_NOTIFICATION_EMAILS', ['sales@qualityautoparts.com'])
        
        # Send email
        send_mail(
            subject=subject,
            message=email_body,
            from_email=from_email,
            recipient_list=recipient_list,
            fail_silently=False,
        )
        
        logger.info(f"Lead email sent successfully for: {lead.name} ({lead.email})")
        
        # Mark email as sent if field exists
        if hasattr(lead, 'email_sent'):
            lead.email_sent = True
            lead.save(update_fields=['email_sent'])
        
        return True
        
    except Exception as e:
        logger.error(f"Failed to send lead email: {str(e)}")
        return False


def extract_state(location):
    """
    Extract state from location field
    Simple implementation - can be enhanced
    
    Args:
        location: ZIP code or location string
        
    Returns:
        str: State abbreviation or empty string
    """
    if not location:
        return ''
    
    # If it's a 5-digit ZIP code, you could use a ZIP->State lookup
    # For now, return empty or implement lookup logic
    # This is a placeholder - enhance based on your needs
    
    # If location is 2 characters, assume it's already a state abbreviation
    if len(location) == 2 and location.isalpha():
        return location.upper()
    
    return ''


def send_test_email():
    """
    Send a test email to verify configuration
    Useful for testing SMTP settings
    """
    try:
        send_mail(
            subject='Test Email - Django Configuration',
            message='This is a test email to verify your Django email configuration is working correctly.',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=settings.LEAD_NOTIFICATION_EMAILS,
            fail_silently=False,
        )
        return True
    except Exception as e:
        logger.error(f"Test email failed: {str(e)}")
        return False


def send_user_confirmation_email(lead):
    """
    Send confirmation email to the user who submitted the lead form
    
    Args:
        lead: Lead model instance
        
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        # Email subject
        subject = "Lead Form Submitted Successfully"
        
        # Email body with all lead details
        email_body = f"""Hello {lead.name},

Thank you for submitting your request on JunkyardsNearMe.

We have received your inquiry with the following details:

Name: {lead.name}
Email: {lead.email}
Phone: {lead.phone}
State: {getattr(lead, 'state', 'N/A')}
Zip: {lead.location}
Year: {lead.year}
Make: {lead.make}
Model: {lead.model}
Part: {lead.part}

Our team will contact you shortly.

— JYNM Team"""
        
        # From email (test@localhost for testing)
        from_email = 'test@localhost'
        
        # Send to the user's email address
        recipient_list = [lead.email]
        
        # Send email
        send_mail(
            subject=subject,
            message=email_body,
            from_email=from_email,
            recipient_list=recipient_list,
            fail_silently=False,
        )
        
        logger.info(f"Confirmation email sent successfully to: {lead.email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send confirmation email to {lead.email}: {str(e)}")
        return False

