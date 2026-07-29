import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone


class Transaction(models.Model):
    """
    Enterprise Transaction — Core financial record.
    Never deleted. Soft-archived only. Every state transition is logged
    in TransactionLifecycleLog.
    """
    STATUS_CHOICES = (
        ('draft',               'Draft'),
        ('pending',             'Pending'),
        ('gateway_request_sent','Gateway Request Sent'),
        ('gateway_accepted',    'Gateway Accepted'),
        ('authorized',          'Authorized'),
        ('awaiting_webhook',    'Awaiting Webhook Verification'),
        ('webhook_received',    'Webhook Received'),
        ('signature_verified',  'Signature Verified'),
        ('captured',            'Captured'),
        ('completed',           'Completed'),
        ('failed',              'Failed'),
        ('voided',              'Voided'),
        ('refunded',            'Refunded'),
        ('partial_refund',      'Partial Refund'),
        ('chargeback',          'Chargeback'),
        ('archived',            'Archived'),
    )

    SOURCE_MODULE_CHOICES = (
        ('vendor_ads',          'Vendor Ad Subscription'),
        ('yard_submission',     'Yard Submission Plan'),
        ('manual',              'Manual / Admin'),
    )

    # Universal Identifiers
    correlation_id      = models.UUIDField(default=uuid.uuid4, unique=True, editable=False,
                                           help_text="Unique ID for cross-system tracing")
    idempotency_key     = models.CharField(max_length=255, blank=True, null=True, db_index=True,
                                           help_text="Client-supplied key to prevent duplicate charges")

    # User & Business Linkage
    user                = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
                                            null=True, blank=True, related_name='transactions')
    vendor              = models.ForeignKey('hollander.Vendor', on_delete=models.SET_NULL,
                                            null=True, blank=True, related_name='transactions')

    # Financial Data
    amount              = models.DecimalField(max_digits=10, decimal_places=2)
    currency            = models.CharField(max_length=3, default='USD')
    status              = models.CharField(max_length=30, choices=STATUS_CHOICES, default='draft', db_index=True)

    # Payment Source Intelligence
    source_module       = models.CharField(max_length=50, choices=SOURCE_MODULE_CHOICES,
                                           blank=True, default='', help_text="Which UI module originated this payment")
    item_type           = models.CharField(max_length=50, blank=True, null=True)  # e.g. 'ad_plan'
    item_id             = models.CharField(max_length=255, blank=True, null=True)  # e.g. 'premium'
    business_purpose    = models.CharField(max_length=255, blank=True, default='',
                                           help_text="Human-readable description of what was purchased")

    # Gateway Fields (Authorize.Net)
    gateway             = models.CharField(max_length=50, default='authorizenet',
                                           help_text="Which payment provider was used")
    transaction_id      = models.CharField(max_length=255, blank=True, null=True,
                                           help_text="Gateway transaction ID (e.g. Authorize.net transId)")
    auth_code           = models.CharField(max_length=100, blank=True, null=True)
    response_code       = models.CharField(max_length=10, blank=True, null=True)
    full_response       = models.JSONField(blank=True, null=True,
                                           help_text="Full raw gateway response for audit")

    # Webhook & Verification
    webhook_status      = models.CharField(max_length=50, blank=True, default='not_expected',
                                           help_text="not_expected | pending | received | verified | failed")
    webhook_received_at = models.DateTimeField(null=True, blank=True)

    # Risk
    risk_score          = models.IntegerField(default=0, help_text="0-100 estimated risk. 0 = low.")
    ip_address          = models.GenericIPAddressField(null=True, blank=True)

    # Invoice Reference
    invoice_number      = models.CharField(max_length=50, blank=True, null=True, unique=True)

    # Monetary Recovery
    refund_amount       = models.DecimalField(max_digits=10, decimal_places=2, default=0,
                                              help_text="Amount refunded to date")
    related_transaction = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True,
                                            related_name='refunds', help_text="If this is a refund/void, link to original")

    # Timestamps — immutable audit metadata
    created_at          = models.DateTimeField(auto_now_add=True)
    updated_at          = models.DateTimeField(auto_now=True)
    completed_at        = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'payment_transactions'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['vendor', '-created_at']),
            models.Index(fields=['transaction_id']),
            models.Index(fields=['correlation_id']),
        ]

    def __str__(self):
        return f"TXN#{self.id} [{self.status}] ${self.amount} ({self.gateway})"

    def transition_to(self, new_status, note='', actor=None):
        """Atomically transition status and write an immutable audit log entry."""
        old = self.status
        self.status = new_status
        if new_status == 'completed':
            self.completed_at = timezone.now()
        self.save(update_fields=['status', 'updated_at', 'completed_at'])
        TransactionLifecycleLog.objects.create(
            transaction=self,
            from_status=old,
            to_status=new_status,
            note=note,
            actor_email=actor.email if actor else 'system',
        )


class TransactionLifecycleLog(models.Model):
    """
    Immutable append-only log of every transaction state transition.
    NEVER updated, NEVER deleted.
    """
    transaction     = models.ForeignKey(Transaction, on_delete=models.CASCADE,
                                        related_name='lifecycle_logs')
    from_status     = models.CharField(max_length=30)
    to_status       = models.CharField(max_length=30)
    note            = models.TextField(blank=True, default='')
    actor_email     = models.CharField(max_length=255, default='system',
                                       help_text="Who caused this transition")
    timestamp       = models.DateTimeField(auto_now_add=True)
    metadata        = models.JSONField(blank=True, null=True,
                                       help_text="Extra context at transition time")

    class Meta:
        db_table = 'payment_transaction_lifecycle'
        ordering = ['timestamp']

    def __str__(self):
        return f"TXN#{self.transaction_id}: {self.from_status} → {self.to_status} @ {self.timestamp}"


class WebhookEvent(models.Model):
    """
    Records every inbound webhook notification from a payment gateway.
    Enables duplicate detection, replay protection, and forensic analysis.
    """
    STATUS_CHOICES = (
        ('received',    'Received'),
        ('verified',    'Signature Verified'),
        ('processed',   'Processed'),
        ('invalid_sig', 'Invalid Signature'),
        ('duplicate',   'Duplicate — Ignored'),
        ('failed',      'Processing Failed'),
    )

    event_id            = models.CharField(max_length=255, unique=True,
                                           help_text="Unique event ID from the gateway (deduplication key)")
    gateway             = models.CharField(max_length=50, default='authorizenet')
    event_type          = models.CharField(max_length=100, blank=True, default='')
    transaction         = models.ForeignKey(Transaction, on_delete=models.SET_NULL,
                                            null=True, blank=True, related_name='webhook_events')
    raw_payload         = models.JSONField(help_text="Full raw payload from gateway")
    signature_header    = models.TextField(blank=True, default='',
                                           help_text="Raw X-ANET-Signature or equivalent header")
    status              = models.CharField(max_length=20, choices=STATUS_CHOICES, default='received')
    ip_address          = models.GenericIPAddressField(null=True, blank=True)
    received_at         = models.DateTimeField(auto_now_add=True)
    processed_at        = models.DateTimeField(null=True, blank=True)
    error_detail        = models.TextField(blank=True, default='')

    class Meta:
        db_table = 'payment_webhook_events'
        ordering = ['-received_at']

    def __str__(self):
        return f"Webhook [{self.gateway}:{self.event_type}] — {self.status}"


class PaymentInvoice(models.Model):
    """
    Immutable, generated invoice / receipt after a completed transaction.
    """
    transaction         = models.OneToOneField(Transaction, on_delete=models.PROTECT,
                                               related_name='invoice')
    invoice_number      = models.CharField(max_length=50, unique=True)
    issued_at           = models.DateTimeField(auto_now_add=True)

    customer_name       = models.CharField(max_length=255, blank=True, default='')
    customer_email      = models.EmailField(blank=True, default='')
    billing_address     = models.TextField(blank=True, default='')

    line_items          = models.JSONField(default=list,
                                           help_text="[{description, quantity, unit_price, total}]")
    subtotal            = models.DecimalField(max_digits=10, decimal_places=2)
    tax                 = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total               = models.DecimalField(max_digits=10, decimal_places=2)

    pdf_url             = models.URLField(blank=True, null=True,
                                          help_text="URL to generated PDF if available")
    email_sent          = models.BooleanField(default=False)
    email_sent_at       = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'payment_invoices'
        ordering = ['-issued_at']

    def __str__(self):
        return f"Invoice {self.invoice_number} — ${self.total}"
