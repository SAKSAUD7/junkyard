"""
Payment Serializers
====================
DRF serializers for admin-facing payment API endpoints.
Read-only — all financial records are immutable after creation.
"""
from rest_framework import serializers
from .models import Transaction, TransactionLifecycleLog, WebhookEvent, PaymentInvoice


class LifecycleLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionLifecycleLog
        fields = ['id', 'from_status', 'to_status', 'actor_email', 'note', 'timestamp', 'metadata']


class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentInvoice
        fields = [
            'id', 'invoice_number', 'issued_at',
            'customer_name', 'customer_email', 'billing_address',
            'line_items', 'subtotal', 'tax', 'total',
            'pdf_url', 'email_sent', 'email_sent_at',
        ]


class TransactionListSerializer(serializers.ModelSerializer):
    """Compact serializer for list views (fast, no lifecycle logs inlined)."""
    user_email = serializers.SerializerMethodField()
    vendor_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    source_module_display = serializers.CharField(source='get_source_module_display', read_only=True)
    invoice_number = serializers.CharField(read_only=True)

    class Meta:
        model = Transaction
        fields = [
            'id', 'correlation_id', 'status', 'status_display',
            'amount', 'currency', 'refund_amount',
            'user_email', 'vendor_name',
            'source_module', 'source_module_display',
            'item_type', 'item_id', 'business_purpose',
            'gateway', 'transaction_id', 'auth_code',
            'invoice_number', 'webhook_status',
            'risk_score', 'ip_address',
            'created_at', 'updated_at', 'completed_at',
        ]

    def get_user_email(self, obj):
        return obj.user.email if obj.user else None

    def get_vendor_name(self, obj):
        return obj.vendor.name if obj.vendor else None


class TransactionDetailSerializer(TransactionListSerializer):
    """Extended serializer for detail view — includes lifecycle logs and invoice."""
    lifecycle_logs = LifecycleLogSerializer(many=True, read_only=True)
    invoice = InvoiceSerializer(read_only=True)
    full_response = serializers.JSONField(read_only=True)

    class Meta(TransactionListSerializer.Meta):
        fields = TransactionListSerializer.Meta.fields + [
            'lifecycle_logs', 'invoice', 'full_response', 'idempotency_key',
        ]


class WebhookEventSerializer(serializers.ModelSerializer):
    transaction_id = serializers.IntegerField(source='transaction.id', read_only=True)
    transaction_amount = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = WebhookEvent
        fields = [
            'id', 'event_id', 'gateway', 'event_type',
            'status', 'status_display',
            'transaction_id', 'transaction_amount',
            'ip_address', 'received_at', 'processed_at',
            'error_detail',
        ]

    def get_transaction_amount(self, obj):
        return str(obj.transaction.amount) if obj.transaction else None


class PaymentStatsSerializer(serializers.Serializer):
    """Stats payload — validated on the way out."""
    total_revenue = serializers.DecimalField(max_digits=15, decimal_places=2)
    completed_count = serializers.IntegerField()
    pending_count = serializers.IntegerField()
    failed_count = serializers.IntegerField()
    refunded_count = serializers.IntegerField()
    this_month_revenue = serializers.DecimalField(max_digits=15, decimal_places=2)
    this_month_count = serializers.IntegerField()
    avg_transaction = serializers.DecimalField(max_digits=15, decimal_places=2)
    by_source_module = serializers.JSONField()
    by_status = serializers.JSONField()
