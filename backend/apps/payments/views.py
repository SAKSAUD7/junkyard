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
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import views, status, permissions
from rest_framework.response import Response

from .models import Transaction, TransactionLifecycleLog, WebhookEvent, PaymentInvoice
from .providers.authorizenet import AuthorizeNetProvider

logger = logging.getLogger(__name__)

# Singleton provider instance — swap class to change gateway everywhere
_provider = AuthorizeNetProvider()


def _generate_invoice_number(txn: Transaction) -> str:
    return f"INV-{timezone.now().strftime('%Y%m')}-{txn.id:06d}"  # type: ignore


def _create_invoice(txn: Transaction) -> PaymentInvoice:
    """Generate an immutable invoice after successful payment."""
    invoice_number = _generate_invoice_number(txn)
    user = txn.user
    customer_name  = f"{user.first_name} {user.last_name}".strip() if user else ''  # type: ignore
    customer_email = user.email if user else ''  # type: ignore

    inv = PaymentInvoice.objects.create(  # type: ignore
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
    txn.invoice_number = invoice_number  # type: ignore
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
            existing = Transaction.objects.filter(idempotency_key=idempotency_key).first()  # type: ignore
            if existing:
                if existing.status == 'completed':
                    logger.info("Idempotency hit: returning existing completed txn %s", existing.id)
                    return Response({
                        'success': True,
                        'transaction_id': existing.transaction_id,
                        'internal_id': existing.id,
                        'idempotent': True,
                    }, status=status.HTTP_200_OK)
                elif existing.status in ['draft', 'pending', 'gateway_request_sent', 'processing']:
                    logger.warning("Duplicate request blocked for in-progress key %s", idempotency_key)
                    return Response({
                        'error': 'Payment is already processing. Please wait.'
                    }, status=status.HTTP_409_CONFLICT)
                # If transaction failed previously, we will allow creating a new one (although ideally with a new key).

        # ── Resolve vendor FK if possible ────────────────────────────
        vendor = None
        try:
            vendor = request.user.vendor_profile.vendor
        except Exception:
            pass  # Customer payment — no vendor FK needed

        # ── Create Draft Transaction ─────────────────────────────────
        txn = Transaction.objects.create(  # type: ignore
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
            
            # Send Success Email
            try:
                send_mail(
                    subject=f"JYNM - Payment Receipt for {txn.item_type}",
                    message=f"Hello,\n\nYour payment of ${amount} has been successfully processed.\nInvoice Number: {txn.invoice_number}\nTransaction ID: {result.transaction_id}\n\nThank you for choosing JYNM!",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[request.user.email],
                    fail_silently=True,
                )
            except Exception as e:
                logger.error("Failed to send success email for TXN#%s: %s", txn.id, e)

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
            
            # Send Failure Email
            try:
                send_mail(
                    subject=f"JYNM - Payment Failed",
                    message=f"Hello,\n\nUnfortunately, your payment of ${amount} could not be processed.\nReason: {result.error}\n\nPlease try again or contact support.",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[request.user.email],
                    fail_silently=True,
                )
            except Exception as e:
                logger.error("Failed to send failure email for TXN#%s: %s", txn.id, e)

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
            txn = Transaction.objects.get(pk=pk, status='completed')  # type: ignore
        except Transaction.DoesNotExist:  # type: ignore
            return Response({'error': 'Completed transaction not found.'}, status=status.HTTP_404_NOT_FOUND)

        amount_raw = request.data.get('amount', txn.amount)
        try:
            refund_amount = Decimal(str(amount_raw))
        except Exception:
            return Response({'error': 'Invalid refund amount.'}, status=status.HTTP_400_BAD_REQUEST)

        result = _provider.refund(
            transaction_id=txn.transaction_id,  # type: ignore
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
        if WebhookEvent.objects.filter(event_id=event_id).exists():  # type: ignore
            logger.info("Duplicate webhook received and ignored: event_id=%s", event_id)
            WebhookEvent.objects.filter(event_id=event_id).update(status='duplicate')  # type: ignore
            return Response({'status': 'duplicate'}, status=status.HTTP_200_OK)

        # ── Signature Verification ───────────────────────────────────
        is_valid = _provider.verify_webhook_signature(raw_body, http_headers)

        event = WebhookEvent.objects.create(  # type: ignore
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

        txn = Transaction.objects.filter(transaction_id=gateway_txn_id).first()  # type: ignore
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
                txn = Transaction.objects.get(pk=pk)  # type: ignore
            else:
                txn = Transaction.objects.get(pk=pk, user=request.user)  # type: ignore
        except Transaction.DoesNotExist:  # type: ignore
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        invoice = None
        try:
            invoice = {
                'invoice_number': txn.invoice.invoice_number,  # type: ignore
                'total': str(txn.invoice.total),  # type: ignore
                'issued_at': txn.invoice.issued_at,  # type: ignore
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
                for log in txn.lifecycle_logs.all()  # type: ignore
            ],
        })


def _get_client_ip(request) -> str:
    """Extract real client IP from request headers."""
    x_forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded:
        return x_forwarded.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR', '')


# ─────────────────────────────────────────────────────────────────────────────
# ADMIN VIEWS — Staff/IsAdminUser required for all below
# ─────────────────────────────────────────────────────────────────────────────

class TransactionListView(views.APIView):
    """
    GET /api/payments/admin/transactions/

    Staff-only paginated transaction list with rich filtering.
    Query params:
        status, source_module, gateway — exact match
        user_email                      — icontains search on user.email
        transaction_id                  — exact match on gateway txn ID
        invoice_number                  — exact match
        start_date, end_date            — ISO date strings (created_at range)
        page, page_size                 — pagination (default page_size=25)
    """
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        from .serializers import TransactionListSerializer
        qs = Transaction.objects.select_related('user', 'vendor').order_by('-created_at')  # type: ignore

        # Filters
        status_f = request.query_params.get('status')
        if status_f:
            qs = qs.filter(status=status_f)

        source_f = request.query_params.get('source_module')
        if source_f:
            qs = qs.filter(source_module=source_f)

        gateway_f = request.query_params.get('gateway')
        if gateway_f:
            qs = qs.filter(gateway=gateway_f)

        email_f = request.query_params.get('user_email')
        if email_f:
            qs = qs.filter(user__email__icontains=email_f)

        txn_id_f = request.query_params.get('transaction_id')
        if txn_id_f:
            qs = qs.filter(transaction_id=txn_id_f)

        inv_f = request.query_params.get('invoice_number')
        if inv_f:
            qs = qs.filter(invoice_number=inv_f)

        start_f = request.query_params.get('start_date')
        if start_f:
            qs = qs.filter(created_at__date__gte=start_f)

        end_f = request.query_params.get('end_date')
        if end_f:
            qs = qs.filter(created_at__date__lte=end_f)

        # Pagination
        page_size = min(int(request.query_params.get('page_size', 25)), 200)
        page = max(int(request.query_params.get('page', 1)), 1)
        total = qs.count()
        offset = (page - 1) * page_size
        qs = qs[offset: offset + page_size]

        serializer = TransactionListSerializer(qs, many=True)
        return Response({
            'count': total,
            'page': page,
            'page_size': page_size,
            'total_pages': (total + page_size - 1) // page_size if page_size else 1,
            'results': serializer.data,
        })


class TransactionDetailAdminView(views.APIView):
    """
    GET /api/payments/admin/transactions/<pk>/
    Full transaction detail including lifecycle logs and invoice.
    """
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, pk):
        from .serializers import TransactionDetailSerializer
        try:
            txn = Transaction.objects.select_related('user', 'vendor').prefetch_related(  # type: ignore
                'lifecycle_logs', 'invoice'
            ).get(pk=pk)
        except Transaction.DoesNotExist:  # type: ignore
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(TransactionDetailSerializer(txn).data)


class TransactionStatsView(views.APIView):
    """
    GET /api/payments/admin/stats/

    Aggregated KPIs for the admin financial dashboard.
    Returns revenue totals, counts by status, breakdown by source module,
    and this-month figures.
    """
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        from django.db.models import Sum, Count, Avg, Q
        from decimal import Decimal

        now = timezone.now()
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        all_txns = Transaction.objects.all()  # type: ignore

        # Overall
        completed_qs = all_txns.filter(status='completed')
        totals = completed_qs.aggregate(
            total_revenue=Sum('amount'),
            avg_transaction=Avg('amount'),
        )

        # This month
        this_month = completed_qs.filter(created_at__gte=month_start).aggregate(
            revenue=Sum('amount'),
            count=Count('id'),
        )

        # Count by status
        by_status_raw = all_txns.values('status').annotate(count=Count('id')).order_by('-count')
        by_status = {row['status']: row['count'] for row in by_status_raw}

        # Count by source module (completed only)
        by_source_raw = completed_qs.values('source_module').annotate(
            count=Count('id'), revenue=Sum('amount')
        ).order_by('-revenue')
        by_source = [
            {'module': r['source_module'] or 'unknown', 'count': r['count'], 'revenue': str(r['revenue'] or 0)}
            for r in by_source_raw
        ]

        return Response({
            'total_revenue': str(totals['total_revenue'] or Decimal('0.00')),
            'completed_count': completed_qs.count(),
            'pending_count': by_status.get('pending', 0) + by_status.get('gateway_request_sent', 0),
            'failed_count': by_status.get('failed', 0),
            'refunded_count': by_status.get('refunded', 0) + by_status.get('partial_refund', 0),
            'this_month_revenue': str(this_month['revenue'] or Decimal('0.00')),
            'this_month_count': this_month['count'] or 0,
            'avg_transaction': str(totals['avg_transaction'] or Decimal('0.00')),
            'by_source_module': by_source,
            'by_status': by_status,
        })


class WebhookEventListView(views.APIView):
    """
    GET /api/payments/admin/webhooks/

    Staff-only paginated webhook event list.
    Query params: status, gateway, page, page_size
    """
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        from .serializers import WebhookEventSerializer
        qs = WebhookEvent.objects.select_related('transaction').order_by('-received_at')  # type: ignore

        status_f = request.query_params.get('status')
        if status_f:
            qs = qs.filter(status=status_f)

        gateway_f = request.query_params.get('gateway')
        if gateway_f:
            qs = qs.filter(gateway=gateway_f)

        page_size = min(int(request.query_params.get('page_size', 25)), 200)
        page = max(int(request.query_params.get('page', 1)), 1)
        total = qs.count()
        offset = (page - 1) * page_size
        qs = qs[offset: offset + page_size]

        serializer = WebhookEventSerializer(qs, many=True)
        return Response({
            'count': total,
            'page': page,
            'page_size': page_size,
            'results': serializer.data,
        })


class InvoiceListView(views.APIView):
    """
    GET /api/payments/admin/invoices/

    Staff-only paginated invoice list.
    Query params: email (customer_email icontains), invoice_number, page, page_size
    """
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        from .serializers import InvoiceSerializer
        qs = PaymentInvoice.objects.select_related('transaction').order_by('-issued_at')  # type: ignore

        email_f = request.query_params.get('email')
        if email_f:
            qs = qs.filter(customer_email__icontains=email_f)

        inv_f = request.query_params.get('invoice_number')
        if inv_f:
            qs = qs.filter(invoice_number__icontains=inv_f)

        page_size = min(int(request.query_params.get('page_size', 25)), 200)
        page = max(int(request.query_params.get('page', 1)), 1)
        total = qs.count()
        offset = (page - 1) * page_size
        qs = qs[offset: offset + page_size]

        serializer = InvoiceSerializer(qs, many=True)
        return Response({
            'count': total,
            'page': page,
            'page_size': page_size,
            'results': serializer.data,
        })

