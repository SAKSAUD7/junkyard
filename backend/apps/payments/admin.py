"""
Enterprise Payment Admin Portal
================================
Advanced financial operations interface within the Django Admin.
Provides revenue metrics, lifecycle timelines, webhook health, and export tools.
"""
import csv
from django.contrib import admin
from django.http import HttpResponse
from django.utils.html import format_html
from django.utils import timezone
from django.db.models import Sum, Count, Q

from .models import Transaction, TransactionLifecycleLog, WebhookEvent, PaymentInvoice


# ──────────────────────────────────────────────────────────────────────────────
# Inline: Transaction Lifecycle Logs
# ──────────────────────────────────────────────────────────────────────────────
class LifecycleLogInline(admin.TabularInline):
    model = TransactionLifecycleLog
    extra = 0
    fields = ('from_status', 'to_status', 'actor_email', 'note', 'timestamp')
    readonly_fields = fields
    can_delete = False
    ordering = ('timestamp',)
    verbose_name = "Lifecycle Event"
    verbose_name_plural = "Transaction Audit Trail"


# ──────────────────────────────────────────────────────────────────────────────
# Inline: Invoices  
# ──────────────────────────────────────────────────────────────────────────────
class InvoiceInline(admin.TabularInline):
    model = PaymentInvoice
    extra = 0
    fields = ('invoice_number', 'customer_name', 'customer_email', 'total', 'issued_at', 'email_sent')
    readonly_fields = fields
    can_delete = False


# ──────────────────────────────────────────────────────────────────────────────
# Transaction Admin
# ──────────────────────────────────────────────────────────────────────────────
@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'colored_status', 'amount_display', 'currency',
        'user_email', 'vendor_name', 'source_module',
        'gateway', 'transaction_id',
        'invoice_number', 'created_at',
    )
    list_filter = (
        'status', 'gateway', 'source_module', 'currency',
        ('created_at', admin.DateFieldListFilter),
    )
    search_fields = (
        'user__email', 'transaction_id', 'auth_code',
        'invoice_number', 'vendor__name', 'item_id',
        'correlation_id',
    )
    readonly_fields = (
        'correlation_id', 'idempotency_key',
        'user', 'vendor',
        'transaction_id', 'auth_code', 'response_code', 'full_response',
        'webhook_received_at', 'risk_score', 'ip_address',
        'invoice_number', 'created_at', 'updated_at', 'completed_at',
        'refund_amount',
    )
    fieldsets = (
        ('💳 Financial Summary', {
            'fields': (
                ('amount', 'currency', 'status'),
                ('source_module', 'item_type', 'item_id'),
                'business_purpose',
            )
        }),
        ('🔗 Relationships', {
            'fields': ('user', 'vendor'),
        }),
        ('🏦 Gateway Details', {
            'fields': (
                ('gateway', 'transaction_id'),
                ('auth_code', 'response_code'),
                'full_response',
            ),
            'classes': ('collapse',),
        }),
        ('🔒 Security & Audit', {
            'fields': (
                'correlation_id', 'idempotency_key', 'ip_address', 'risk_score',
            ),
            'classes': ('collapse',),
        }),
        ('📋 Invoice', {
            'fields': ('invoice_number',),
        }),
        ('🔄 Refund', {
            'fields': ('refund_amount', 'related_transaction'),
            'classes': ('collapse',),
        }),
        ('⏱ Timestamps', {
            'fields': ('created_at', 'updated_at', 'completed_at', 'webhook_received_at'),
            'classes': ('collapse',),
        }),
    )
    inlines = [LifecycleLogInline, InvoiceInline]
    actions = ['export_as_csv', 'action_mark_refunded', 'action_void_pending']
    ordering = ('-created_at',)
    date_hierarchy = 'created_at'

    # ── Custom columns ───────────────────────────────────────────────
    @admin.display(description='Status', ordering='status')
    def colored_status(self, obj):
        colors = {
            'completed':  ('green',  '✅'),
            'failed':     ('red',    '❌'),
            'pending':    ('orange', '⏳'),
            'refunded':   ('blue',   '↩️'),
            'partial_refund': ('teal','↩️'),
            'chargeback': ('darkred','⚠️'),
            'voided':     ('gray',   '🚫'),
            'draft':      ('silver', '📝'),
        }
        color, icon = colors.get(obj.status, ('black', ''))
        return format_html(
            '<span style="color:{};font-weight:bold">{} {}</span>',
            color, icon, obj.get_status_display()
        )

    @admin.display(description='Amount', ordering='amount')
    def amount_display(self, obj):
        return f"${obj.amount:,.2f}"

    @admin.display(description='User', ordering='user__email')
    def user_email(self, obj):
        return obj.user.email if obj.user else '—'

    @admin.display(description='Vendor', ordering='vendor__name')
    def vendor_name(self, obj):
        return obj.vendor.name if obj.vendor else '—'

    # ── CSV Export ───────────────────────────────────────────────────
    @admin.action(description="📥 Export selected transactions to CSV")
    def export_as_csv(self, request, queryset):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = (
            f'attachment; filename="jynm_transactions_{timezone.now().strftime("%Y%m%d_%H%M")}.csv"'
        )
        writer = csv.writer(response)
        writer.writerow([
            'ID', 'Correlation ID', 'Status', 'Amount', 'Currency',
            'User Email', 'Vendor', 'Source Module', 'Item Type', 'Item ID',
            'Gateway', 'Transaction ID', 'Auth Code', 'Invoice #',
            'Created At', 'Completed At',
        ])
        for txn in queryset.select_related('user', 'vendor'):
            writer.writerow([
                txn.id, txn.correlation_id, txn.status, txn.amount, txn.currency,
                txn.user.email if txn.user else '',
                txn.vendor.name if txn.vendor else '',
                txn.source_module, txn.item_type, txn.item_id,
                txn.gateway, txn.transaction_id, txn.auth_code,
                txn.invoice_number,
                txn.created_at.isoformat() if txn.created_at else '',
                txn.completed_at.isoformat() if txn.completed_at else '',
            ])
        return response

    @admin.action(description="↩️ Mark selected as Refunded")
    def action_mark_refunded(self, request, queryset):
        for txn in queryset.filter(status='completed'):
            txn.transition_to('refunded', note='Manual admin action', actor=request.user)
        self.message_user(request, "Selected transactions marked as refunded.")

    @admin.action(description="🚫 Mark selected as Voided")
    def action_void_pending(self, request, queryset):
        for txn in queryset.filter(status__in=['pending', 'draft', 'gateway_request_sent']):
            txn.transition_to('voided', note='Manual admin void', actor=request.user)
        self.message_user(request, "Selected transactions voided.")


# ──────────────────────────────────────────────────────────────────────────────
# Transaction Lifecycle Admin (read-only audit)
# ──────────────────────────────────────────────────────────────────────────────
@admin.register(TransactionLifecycleLog)
class TransactionLifecycleLogAdmin(admin.ModelAdmin):
    list_display = ('transaction_id', 'from_status', 'to_status', 'actor_email', 'note', 'timestamp')
    list_filter  = ('from_status', 'to_status', ('timestamp', admin.DateFieldListFilter))
    search_fields = ('transaction__id', 'actor_email', 'note')
    readonly_fields = ('transaction', 'from_status', 'to_status', 'actor_email', 'note', 'timestamp', 'metadata')
    ordering = ('-timestamp',)


    def has_add_permission(self, request):
        return False  # Immutable — only created programmatically

    def has_change_permission(self, request, obj=None):
        return False  # Never editable

    def has_delete_permission(self, request, obj=None):
        return False  # Never deletable


# ──────────────────────────────────────────────────────────────────────────────
# Webhook Events Admin
# ──────────────────────────────────────────────────────────────────────────────
@admin.register(WebhookEvent)
class WebhookEventAdmin(admin.ModelAdmin):
    list_display = (
        'event_id', 'gateway', 'event_type', 'colored_status',
        'transaction_id', 'ip_address', 'received_at',
    )
    list_filter  = ('status', 'gateway', 'event_type')
    search_fields = ('event_id', 'event_type', 'error_detail')
    readonly_fields = (
        'event_id', 'gateway', 'event_type', 'transaction',
        'raw_payload', 'signature_header', 'status',
        'ip_address', 'received_at', 'processed_at', 'error_detail',
    )
    ordering = ('-received_at',)

    @admin.display(description='Status', ordering='status')
    def colored_status(self, obj):
        colors = {
            'verified':   ('green',  '✅'),
            'processed':  ('blue',   '✔️'),
            'invalid_sig':('red',    '⛔'),
            'duplicate':  ('gray',   '♻️'),
            'failed':     ('red',    '❌'),
            'received':   ('orange', '⏳'),
        }
        c, icon = colors.get(obj.status, ('black', ''))
        return format_html('<span style="color:{};font-weight:bold">{} {}</span>', c, icon, obj.status)

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


# ──────────────────────────────────────────────────────────────────────────────
# Invoice Admin
# ──────────────────────────────────────────────────────────────────────────────
@admin.register(PaymentInvoice)
class PaymentInvoiceAdmin(admin.ModelAdmin):
    list_display = (
        'invoice_number', 'customer_name', 'customer_email',
        'total', 'email_sent', 'issued_at',
    )
    search_fields = ('invoice_number', 'customer_name', 'customer_email')
    list_filter   = ('email_sent', ('issued_at', admin.DateFieldListFilter))
    readonly_fields = (
        'transaction', 'invoice_number', 'issued_at',
        'customer_name', 'customer_email', 'billing_address',
        'line_items', 'subtotal', 'tax', 'total',
        'pdf_url', 'email_sent', 'email_sent_at',
    )
    ordering = ('-issued_at',)

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
