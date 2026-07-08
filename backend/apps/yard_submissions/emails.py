"""
HTML Email Templates for JYNM Yard Submission Workflow
Covers: Submission Confirmation, Admin Alert, Approval, Rejection emails.
"""
from django.core.mail import send_mail, EmailMessage
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from datetime import date


JYNM_BLUE = "#1a56ff"
FONT = "font-family: 'Segoe UI', Helvetica, Arial, sans-serif;"


def _html_wrapper(content: str, preview_text: str = "") -> str:
    return f"""
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>JYNM</title>
</head>
<body style="margin:0;padding:0;background:#f4f6fb;{FONT}">
  <span style="display:none;max-height:0;overflow:hidden;">{preview_text}</span>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f6fb;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);max-width:600px;">

        <!-- HEADER -->
        <tr>
          <td style="background:{JYNM_BLUE};padding:28px 40px;text-align:center;">
            <div style="color:#ffffff;font-size:26px;font-weight:900;letter-spacing:-0.5px;">JYNM</div>
            <div style="color:rgba(255,255,255,0.75);font-size:13px;letter-spacing:1px;margin-top:4px;">JUNKYARDS NEAR ME</div>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="padding:40px;">
            {content}
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#f8fafc;padding:24px 40px;border-top:1px solid #e8ecf4;text-align:center;">
            <p style="margin:0 0 8px;color:#94a3b8;font-size:12px;">© {date.today().year} Junkyards Near Me · All rights reserved</p>
            <p style="margin:0;color:#94a3b8;font-size:11px;">
              <a href="mailto:support@jynm.com" style="color:{JYNM_BLUE};text-decoration:none;">support@jynm.com</a>
              &nbsp;·&nbsp; (800) XXX-XXXX
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
"""


def _btn(label: str, url: str, color: str = JYNM_BLUE) -> str:
    return f"""
<div style="text-align:center;margin:24px 0;">
  <a href="{url}" style="background:{color};color:#ffffff;text-decoration:none;
     padding:14px 32px;border-radius:10px;font-size:15px;font-weight:700;display:inline-block;">
    {label}
  </a>
</div>
"""


def _row(label: str, value: str) -> str:
    return f"""
<tr>
  <td style="padding:10px 16px;background:#f8fafc;font-size:13px;color:#64748b;
             font-weight:600;border-radius:6px 0 0 6px;width:40%;white-space:nowrap;">{label}</td>
  <td style="padding:10px 16px;font-size:13px;color:#1e293b;font-weight:700;">{value or '—'}</td>
</tr>
"""


def _divider():
    return '<hr style="border:none;border-top:1px solid #e8ecf4;margin:24px 0;">'


# ----------------------------------------------------------
# EMAIL 1 — VENDOR Submission Confirmation
# ----------------------------------------------------------
def send_submission_confirmation(submission):
    """Email 1: Sent immediately to vendor after form submission."""
    site_url = getattr(settings, 'SITE_URL', 'http://localhost:3000')
    owner = submission.owner_first_name or submission.contact_name or submission.business_name

    content = f"""
<h2 style="margin:0 0 6px;font-size:22px;font-weight:900;color:#1e293b;">
  ✅ We've Received Your Application!
</h2>
<p style="color:#64748b;font-size:14px;margin:0 0 24px;">
  Hi <strong>{owner}</strong>, thank you for submitting your junkyard to <strong>Junkyards Near Me (JYNM)</strong>.
  Our team will begin reviewing your information shortly.
</p>

{_divider()}

<h3 style="font-size:15px;font-weight:800;color:#1e293b;margin:0 0 12px;">📋 Submission Summary</h3>
<table width="100%" cellpadding="0" cellspacing="4" border="0" style="border-collapse:separate;border-spacing:0 4px;">
  {_row("Business Name", submission.business_name)}
  {_row("Owner", owner)}
  {_row("Email", submission.email)}
  {_row("Phone", submission.phone)}
  {_row("Location", f"{submission.city}, {submission.state} {submission.zip_code}")}
  {_row("Plan Selected", dict(getattr(submission, 'PLAN_CHOICES', [])).get(submission.subscription_plan, submission.subscription_plan or 'Free'))}
  {_row("Submission ID", f"#{submission.id}")}
  {_row("Submitted On", submission.created_at.strftime('%B %d, %Y at %I:%M %p') if submission.created_at else '—')}
</table>

{_divider()}

<h3 style="font-size:15px;font-weight:800;color:#1e293b;margin:0 0 16px;">🚀 What Happens Next?</h3>
<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td style="width:36px;vertical-align:top;padding-top:3px;">
      <div style="width:32px;height:32px;background:{JYNM_BLUE};border-radius:50%;
                  color:#fff;font-weight:900;font-size:14px;text-align:center;line-height:32px;">1</div>
    </td>
    <td style="padding:0 0 16px 12px;">
      <div style="font-weight:700;color:#1e293b;font-size:14px;">Business Verification</div>
      <div style="color:#64748b;font-size:13px;">Our team verifies your business information.</div>
    </td>
  </tr>
  <tr>
    <td style="width:36px;vertical-align:top;padding-top:3px;">
      <div style="width:32px;height:32px;background:{JYNM_BLUE};border-radius:50%;
                  color:#fff;font-weight:900;font-size:14px;text-align:center;line-height:32px;">2</div>
    </td>
    <td style="padding:0 0 16px 12px;">
      <div style="font-weight:700;color:#1e293b;font-size:14px;">Follow-up if Needed</div>
      <div style="color:#64748b;font-size:13px;">If we need more info, we'll reach out to you directly.</div>
    </td>
  </tr>
  <tr>
    <td style="width:36px;vertical-align:top;padding-top:3px;">
      <div style="width:32px;height:32px;background:#10b981;border-radius:50%;
                  color:#fff;font-weight:900;font-size:14px;text-align:center;line-height:32px;">3</div>
    </td>
    <td style="padding:0 0 16px 12px;">
      <div style="font-weight:700;color:#1e293b;font-size:14px;">Go Live!</div>
      <div style="color:#64748b;font-size:13px;">Once approved, your listing becomes searchable across JYNM.</div>
    </td>
  </tr>
</table>

<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:14px 18px;margin:20px 0;">
  <span style="font-size:13px;color:#1d4ed8;font-weight:600;">⏱ Estimated Review Time: <strong>24–48 Business Hours</strong></span>
</div>

{_btn("View Listing After Approval →", f"{site_url}/junkyards")}

<p style="text-align:center;font-size:12px;color:#94a3b8;margin-top:8px;">
  Questions? Email us at <a href="mailto:support@jynm.com" style="color:{JYNM_BLUE};">support@jynm.com</a>
</p>
"""
    html = _html_wrapper(content, f"We've received your JYNM submission — #{submission.id}")

    msg = EmailMultiAlternatives(
        subject=f"✅ We've Received Your Junkyard Submission | JYNM",
        body=f"Hi {owner}, thank you for submitting to JYNM. Your submission #{submission.id} is under review.",
        from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@jynm.com'),
        to=[submission.email],
    )
    msg.content_subtype = 'plain'
    msg.attach_alternative(html, "text/html")
    msg.send(fail_silently=True)


# ----------------------------------------------------------
# EMAIL 2 — ADMIN New Submission Alert
# ----------------------------------------------------------
def send_admin_submission_alert(submission):
    """Email 2: Sent to admin when a new yard is submitted."""
    site_url = getattr(settings, 'SITE_URL', 'http://localhost:3000')
    admin_email = getattr(settings, 'ADMIN_EMAIL', 'admin@jynm.com')

    plan_display = dict(getattr(submission.__class__, 'PLAN_CHOICES', [])).get(submission.subscription_plan, submission.subscription_plan or 'free')

    content = f"""
<div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:10px;padding:14px 18px;margin-bottom:24px;">
  <span style="font-size:15px;font-weight:800;color:#92400e;">🚨 New Vendor Submission Received</span>
</div>

<h3 style="font-size:15px;font-weight:800;color:#1e293b;margin:0 0 12px;">Submission Details</h3>
<table width="100%" cellpadding="0" cellspacing="4" border="0" style="border-collapse:separate;border-spacing:0 4px;">
  {_row("Business Name", submission.business_name)}
  {_row("Owner", submission.owner_first_name + ' ' + submission.owner_last_name if submission.owner_first_name else submission.contact_name)}
  {_row("Email", submission.email)}
  {_row("Phone", submission.phone)}
  {_row("Location", f"{submission.city}, {submission.state}")}
  {_row("Plan", plan_display.title())}
  {_row("Payment", getattr(submission, 'payment_status', 'N/A'))}
  {_row("Submission Time", submission.created_at.strftime('%d %B %Y at %I:%M %p') if submission.created_at else '—')}
  {_row("Submission ID", f"#{submission.id}")}
</table>

{_btn("Review Vendor →", f"{site_url}/admin-portal/yard-submissions", "#f59e0b")}
"""
    html = _html_wrapper(content, f"New vendor submission: {submission.business_name}")

    msg = EmailMultiAlternatives(
        subject=f"🚨 New Vendor Submission: {submission.business_name}",
        body=f"New yard submitted by {submission.business_name} from {submission.city}, {submission.state}. Review at {site_url}/admin-portal/yard-submissions",
        from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@jynm.com'),
        to=[admin_email],
    )
    msg.content_subtype = 'plain'
    msg.attach_alternative(html, "text/html")
    msg.send(fail_silently=True)


# ----------------------------------------------------------
# EMAIL 3 — VENDOR Approval ("Your Listing is Live")
# ----------------------------------------------------------
def send_approval_email(submission):
    """Email 3: Sent to vendor when admin approves."""
    site_url = getattr(settings, 'SITE_URL', 'http://localhost:3000')
    owner = submission.owner_first_name or submission.contact_name or submission.business_name
    listing_url = f"{site_url}{submission.created_vendor.profile_url}" if submission.created_vendor else f"{site_url}/junkyards"
    dashboard_url = f"{site_url}/vendors/dashboard"

    plan_display = dict(getattr(submission.__class__, 'PLAN_CHOICES', [])).get(submission.subscription_plan, submission.subscription_plan or 'Free Plan')

    content = f"""
<h2 style="margin:0 0 6px;font-size:22px;font-weight:900;color:#1e293b;">
  🎉 Your Junkyard is Now Live on JYNM!
</h2>
<p style="color:#64748b;font-size:14px;margin:0 0 24px;">
  Hello <strong>{owner}</strong>,<br><br>
  Congratulations! Your junkyard <strong>{submission.business_name}</strong> has been approved and is now live on JYNM.
  Customers can discover your business, browse your inventory and contact you directly.
</p>

{_divider()}

<h3 style="font-size:15px;font-weight:800;color:#1e293b;margin:0 0 12px;">📍 Your Listing</h3>
<table width="100%" cellpadding="0" cellspacing="4" border="0" style="border-collapse:separate;border-spacing:0 4px;">
  {_row("Business", submission.business_name)}
  {_row("Location", f"{submission.city}, {submission.state}")}
  {_row("Plan", plan_display)}
  {_row("Status", "✅ LIVE")}
</table>

<div style="display:flex;gap:12px;margin:24px 0;">
  {_btn("View Your Listing →", listing_url, JYNM_BLUE)}
</div>
<div style="text-align:center;">
  <a href="{dashboard_url}" style="color:{JYNM_BLUE};text-decoration:none;font-size:14px;font-weight:700;">
    Open Your Vendor Dashboard →
  </a>
</div>

{_divider()}
<p style="font-size:13px;color:#64748b;text-align:center;margin:0;">
  Thank you for becoming a trusted JYNM partner. We're excited to help grow your business!
</p>
"""
    html = _html_wrapper(content, f"Your junkyard {submission.business_name} is now LIVE!")

    msg = EmailMultiAlternatives(
        subject=f"🎉 Your Junkyard is Now Live on JYNM | {submission.business_name}",
        body=f"Congratulations! Your junkyard {submission.business_name} has been approved and is now live on JYNM.",
        from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@jynm.com'),
        to=[submission.email],
    )
    msg.content_subtype = 'plain'
    msg.attach_alternative(html, "text/html")
    msg.send(fail_silently=True)


# ----------------------------------------------------------
# EMAIL 4 — VENDOR Rejection
# ----------------------------------------------------------
def send_rejection_email(submission, reason: str = ''):
    """Email 4: Sent to vendor when admin rejects."""
    site_url = getattr(settings, 'SITE_URL', 'http://localhost:3000')
    owner = submission.owner_first_name or submission.contact_name or submission.business_name

    reason_block = f"""
<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:14px 18px;margin:20px 0;">
  <div style="font-size:13px;font-weight:700;color:#dc2626;margin-bottom:4px;">Reason Given:</div>
  <div style="font-size:13px;color:#7f1d1d;">{reason or "No specific reason was provided. Please contact support for details."}</div>
</div>
""" if reason else ""

    content = f"""
<h2 style="margin:0 0 6px;font-size:22px;font-weight:900;color:#1e293b;">
  Action Required: Submission Needs Attention
</h2>
<p style="color:#64748b;font-size:14px;margin:0 0 24px;">
  Hello <strong>{owner}</strong>,<br><br>
  Thank you for submitting <strong>{submission.business_name}</strong> to JYNM.
  Unfortunately, we couldn't approve your listing at this time.
</p>

{reason_block}

<p style="font-size:14px;color:#64748b;">
  Once you've addressed the issue, please resubmit and our team will review it again promptly.
</p>

{_btn("Edit & Resubmit →", f"{site_url}/add-a-yard", "#ef4444")}

{_divider()}
<p style="font-size:13px;color:#94a3b8;text-align:center;margin:0;">
  Need assistance? Reach us at <a href="mailto:support@jynm.com" style="color:{JYNM_BLUE};">support@jynm.com</a>
</p>
"""
    html = _html_wrapper(content, f"Update on your JYNM submission for {submission.business_name}")

    msg = EmailMultiAlternatives(
        subject=f"Action Required: Your JYNM Submission Needs Attention",
        body=f"Hello {owner}, we couldn't approve {submission.business_name} yet. Reason: {reason or 'Please contact support.'}",
        from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@jynm.com'),
        to=[submission.email],
    )
    msg.content_subtype = 'plain'
    msg.attach_alternative(html, "text/html")
    msg.send(fail_silently=True)
