"""
Enterprise Payment Views
=========================
Full lifecycle-aware payment controllers.
Every payment is traced, audited, and recoverable.
"""
import uuid
import logging
from decimal import Decimal
from django.utils import timezone
from rest_framework import views, status, permissions
from rest_framework.response import Response

from .models import Transaction, TransactionLifecycleLog, WebhookEvent, PaymentInvoice
from .providers.authorizenet import AuthorizeNetProvider

logger = logging.getLogger(__name__)

# Singleton provider instance — swap class to change gateway everywhere
_provider = AuthorizeNetProvider()


def _generate_invoice_number(txn: Transaction) -> str:
    return f"INV-{timezone.now().strftime('%Y%m')}-{txn.id:06d}"


def _create_invoice(txn: Transaction) -> PaymentInvoice:
    """Generate an immutable invoice after successful payment."""
    invoice_number = _generate_invoice_number(txn)
    user = txn.user
    customer_name  = f"{user.first_name} {user.last_name}".strip() if user else ''
    customer_email = user.email if user else ''

    inv = PaymentInvoice.objects.create(
        transaction=txn,
        invoice_number=invoice_number,
        customer_name=customer_name,
        customer_email=customer_email,
        line_items=[{
            'description': txn.business_purpose or txn.item_type or 'Service',
            'quantity': 1,
            'unit_price': str(txn.amount),
            'total': str(txn.amount),
        }],
        subtotal=txn.amount,
        tax=Decimal('0.00'),
        total=txn.amount,
    )
    # Update the transaction's invoice_number field for quick look-ups
    txn.invoice_number = invoice_number
    txn.save(update_fields=['invoice_number'])
    return inv


class ChargeCardView(views.APIView):
    """
    POST /api/payments/charge/
    
    Accepts a payment nonce from Authorize.Net Accept.js and processes a charge.
    Auth: Requires any authenticated user (Customer OR Vendor JWT both valid).
    
    Body:
        nonce          (str)  — Accept.js opaque data value
        amount         (str)  — Decimal amount in USD
        item_type      (str)  — e.g. 'ad_plan'
        item_id        (str)  — e.g. 'premium'
        source_module  (str)  — e.g. 'vendor_ads'
        idempotency_key (str) — Optional client-supplied dedup key
        description    (str)  — Optional human-readable purchase description
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        nonce            = request.data.get('nonce')
        amount_raw       = request.data.get('amount')
        item_type        = request.data.get('item_type', '')
        item_id          = request.data.get('item_id', '')
        source_module    = request.data.get('source_module', '')
        idempotency_key  = request.data.get('idempotency_key', '')
        description      = request.data.get('description', '')

        # ── Validation ──────────────────────────────────────────────
        if not nonce:
            return Response({'error': 'Payment nonce is required.'}, status=status.HTTP_400_BAD_REQUEST)
        if not amount_raw:
            return Response({'error': 'Amount is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            amount = Decimal(str(amount_raw))
            if amount <= 0:
                raise ValueError()
        except (ValueError, Exception):
            return Response({'error': 'Invalid amount.'}, status=status.HTTP_400_BAD_REQUEST)

        # ── Idempotency Check ────────────────────────────────────────
        if idempotency_key:
            existing = Transaction.objects.filter(idempotency_key=idempotency_key).first()
            if existing and existing.status == 'completed':
                logger.info("Idempotency hit: returning existing completed txn %s", existing.id)
                return Response({
                    'success': True,
                    'transaction_id': existing.transaction_id,
                    'internal_id': existing.id,
                    'idempotent': True,
                }, status=status.HTTP_200_OK)

        # ── Resolve vendor FK if possible ────────────────────────────
        vendor = None
        try:
            vendor = request.user.vendor_profile.vendor
        except Exception:
            pass  # Customer payment — no vendor FK needed

        # ── Create Draft Transaction ─────────────────────────────────
        txn = Transaction.objects.create(
            user=request.user,
            vendor=vendor,
            amount=amount,
            status='draft',
            source_module=source_module,
            item_type=item_type,
            item_id=item_id,
            business_purpose=description or f"{item_type}: {item_id}",
            gateway=_provider.GATEWAY_NAME,
            idempotency_key=idempotency_key or None,
            ip_address=_get_client_ip(request),
        )
        txn.transition_to('pending', note='Payment request received')
        txn.transition_to('gateway_request_sent', note='Sending charge request to gateway')

        # ── Charge via Provider ──────────────────────────────────────
        from .providers.base import PaymentRequest as ProviderRequest
        pay_req = ProviderRequest(
            nonce=nonce,
            amount=amount,
            correlation_id=str(txn.correlation_id),
            ref_id=f"TXN_{txn.id}",
            description=description or f"{item_type}:{item_id}",
            customer_email=request.user.email,
            metadata={'ip_address': _get_client_ip(request) or ''},
        )

        result = _provider.charge(pay_req)

        # ── Handle Result ────────────────────────────────────────────
        txn.transaction_id  = result.transaction_id
        txn.auth_code       = result.auth_code
        txn.response_code   = result.response_code
        txn.full_response   = result.full_response
        txn.save(update_fields=['transaction_id', 'auth_code', 'response_code', 'full_response', 'updated_at'])

        if result.success:
            txn.transition_to('gateway_accepted', note='Gateway approved the charge')
            txn.transition_to('captured',         note='Funds captured')
            txn.transition_to('completed',        note='Payment complete — generating invoice')

            # Generate invoice
            try:
                _create_invoice(txn)
            except Exception as inv_err:
                logger.error("Invoice generation failed for TXN#%s: %s", txn.id, inv_err)

            logger.info(
                "Payment SUCCESS: TXN#%s | $%s | gateway_txn=%s | user=%s",
                txn.id, amount, result.transaction_id, request.user.email
            )
            return Response({
                'success': True,
                'transaction_id': result.transaction_id,
                'internal_id': txn.id,
                'invoice_number': txn.invoice_number,
                'correlation_id': str(txn.correlation_id),
            }, status=status.HTTP_200_OK)

        else:
            txn.transition_to('failed', note=f"Gateway declined: {result.error}")
            logger.warning(
                "Payment FAILED: TXN#%s | $%s | error=%s | user=%s",
                txn.id, amount, result.error, request.user.email
            )
            return Response({
                'error': result.error or 'Payment was declined.',
                'internal_id': txn.id,
                'correlation_id': str(txn.correlation_id),
            }, status=status.HTTP_402_PAYMENT_REQUIRED)


class RefundView(views.APIView):
    """
    POST /api/payments/<pk>/refund/
    Admin-only refund endpoint.
    """
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            txn = Transaction.objects.get(pk=pk, status='completed')
        except Transaction.DoesNotExist:
            return Response({'error': 'Completed transaction not found.'}, status=status.HTTP_404_NOT_FOUND)

        amount_raw = request.data.get('amount', txn.amount)
        try:
            refund_amount = Decimal(str(amount_raw))
        except Exception:
            return Response({'error': 'Invalid refund amount.'}, status=status.HTTP_400_BAD_REQUEST)

        result = _provider.refund(
            transaction_id=txn.transaction_id,
            amount=refund_amount,
        )

        if result.success:
            new_status = 'refunded' if refund_amount >= txn.amount else 'partial_refund'
            txn.refund_amount = refund_amount
            txn.save(update_fields=['refund_amount', 'updated_at'])
            txn.transition_to(new_status, note=f"Admin refund: ${refund_amount}", actor=request.user)
            return Response({'success': True, 'refund_transaction_id': result.transaction_id})
        else:
            return Response({'error': result.error}, status=status.HTTP_400_BAD_REQUEST)


class WebhookView(views.APIView):
    """
    POST /api/payments/webhook/
    Receives inbound webhook notifications from Authorize.Net.
    Authentication is handled by signature verification, NOT by JWT.
    """
    permission_classes = [permissions.AllowAny]  # Signature verified below

    def post(self, request):
        raw_body    = request.body
        headers     = request.META
        http_headers = {
            'X-ANET-Signature': headers.get('HTTP_X_ANET_SIGNATURE', ''),
        }

        payload_data = request.data or {}
        event_id     = payload_data.get('notificationId', f'unknown_{uuid.uuid4().hex[:12]}')
        event_type   = payload_data.get('eventType', 'unknown')

        # ── Deduplication ────────────────────────────────────────────
        if WebhookEvent.objects.filter(event_id=event_id).exists():
            logger.info("Duplicate webhook received and ignored: event_id=%s", event_id)
            WebhookEvent.objects.filter(event_id=event_id).update(status='duplicate')
            return Response({'status': 'duplicate'}, status=status.HTTP_200_OK)

        # ── Signature Verification ───────────────────────────────────
        is_valid = _provider.verify_webhook_signature(raw_body, http_headers)

        event = WebhookEvent.objects.create(
            event_id=event_id,
            gateway=_provider.GATEWAY_NAME,
            event_type=event_type,
            raw_payload=payload_data,
            signature_header=http_headers.get('X-ANET-Signature', ''),
            status='verified' if is_valid else 'invalid_sig',
            ip_address=_get_client_ip(request),
        )

        if not is_valid:
            logger.error("Webhook signature verification FAILED: event_id=%s", event_id)
            return Response({'error': 'Invalid signature'}, status=status.HTTP_401_UNAUTHORIZED)

        # ── Process Known Event Types ────────────────────────────────
        try:
            self._handle_event(event, payload_data)
        except Exception as exc:
            logger.exception("Webhook processing error for event_id=%s: %s", event_id, exc)
            event.status = 'failed'
            event.error_detail = str(exc)
            event.save(update_fields=['status', 'error_detail'])
            return Response({'error': 'Internal processing error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        event.status = 'processed'
        event.processed_at = timezone.now()
        event.save(update_fields=['status', 'processed_at'])
        return Response({'status': 'ok'}, status=status.HTTP_200_OK)

    def _handle_event(self, event: WebhookEvent, payload: dict):
        event_type = payload.get('eventType', '')
        gateway_txn_id = (
            payload.get('payload', {}).get('id') or
            payload.get('payload', {}).get('transId', '')
        )
        if not gateway_txn_id:
            return

        txn = Transaction.objects.filter(transaction_id=gateway_txn_id).first()
        if not txn:
            logger.warning("Webhook event %s references unknown gateway_txn=%s", event_type, gateway_txn_id)
            return

        event.transaction = txn
        event.save(update_fields=['transaction'])

        if event_type in ('net.authorize.payment.authcapture.created',
                           'net.authorize.payment.capture.created'):
            txn.transition_to('webhook_received', note=f'Webhook: {event_type}')
            txn.transition_to('signature_verified', note='Signature verified by gateway')
        elif event_type == 'net.authorize.payment.void.created':
            txn.transition_to('voided', note=f'Webhook: void confirmed')
        elif event_type == 'net.authorize.payment.refund.created':
            txn.transition_to('refunded', note=f'Webhook: refund confirmed')

        txn.webhook_received_at = timezone.now()
        txn.save(update_fields=['webhook_received_at', 'updated_at'])


class TransactionDetailView(views.APIView):
    """
    GET /api/payments/<pk>/
    Authenticated user can view their own transaction details.
    Admin can view any transaction.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            if request.user.is_staff:
                txn = Transaction.objects.get(pk=pk)
            else:
                txn = Transaction.objects.get(pk=pk, user=request.user)
        except Transaction.DoesNotExist:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        invoice = None
        try:
            invoice = {
                'invoice_number': txn.invoice.invoice_number,
                'total': str(txn.invoice.total),
                'issued_at': txn.invoice.issued_at,
            }
        except Exception:
            pass

        return Response({
            'id':             txn.id,
            'correlation_id': str(txn.correlation_id),
            'invoice_number': txn.invoice_number,
            'amount':         str(txn.amount),
            'currency':       txn.currency,
            'status':         txn.status,
            'source_module':  txn.source_module,
            'item_type':      txn.item_type,
            'item_id':        txn.item_id,
            'business_purpose': txn.business_purpose,
            'gateway':        txn.gateway,
            'transaction_id': txn.transaction_id,
            'created_at':     txn.created_at,
            'completed_at':   txn.completed_at,
            'invoice':        invoice,
            'lifecycle': [
                {
                    'from': log.from_status,
                    'to':   log.to_status,
                    'note': log.note,
                    'actor': log.actor_email,
                    'at':   log.timestamp,
                }
                for log in txn.lifecycle_logs.all()
            ],
        })


def _get_client_ip(request) -> str:
    """Extract real client IP from request headers."""
    x_forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded:
        return x_forwarded.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR', '')
