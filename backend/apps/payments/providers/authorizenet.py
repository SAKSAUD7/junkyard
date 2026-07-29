"""
Authorize.Net Payment Provider
================================
Concrete implementation of BasePaymentProvider for Authorize.Net.
Uses the JSON REST API (not the SDK) so no extra dependencies are needed.
"""
import os
import uuid
import hmac
import hashlib
import json
import logging
import requests
from decimal import Decimal
from typing import Optional, Dict, Any

from .base import BasePaymentProvider, PaymentRequest, PaymentResult

logger = logging.getLogger(__name__)


class AuthorizeNetProvider(BasePaymentProvider):

    GATEWAY_NAME = 'authorizenet'

    # Authorize.Net JSON API endpoints
    SANDBOX_URL    = 'https://apitest.authorize.net/xml/v1/request.api'
    PRODUCTION_URL = 'https://api.authorize.net/xml/v1/request.api'

    def __init__(self):
        self.login_id       = os.environ.get('AUTHORIZENET_API_LOGIN_ID', '')
        self.transaction_key = os.environ.get('AUTHORIZENET_TRANSACTION_KEY', '')
        self.signature_key  = os.environ.get('AUTHORIZENET_SIGNATURE_KEY', '')  # For webhook HMAC
        self.environment    = os.environ.get('AUTHORIZENET_ENVIRONMENT', 'sandbox')
        self._mock_mode     = not (self.login_id and self.transaction_key)

    @property
    def api_url(self) -> str:
        return self.PRODUCTION_URL if self.environment == 'production' else self.SANDBOX_URL

    @property
    def merchant_auth(self) -> dict:
        return {
            'name': self.login_id,
            'transactionKey': self.transaction_key,
        }

    # -----------------------------------------------------------------
    # PRIVATE: post to Authorize.Net
    # -----------------------------------------------------------------
    def _post(self, payload: dict, timeout: int = 20) -> Dict[str, Any]:
        response = requests.post(
            self.api_url,
            json=payload,
            headers={'Content-Type': 'application/json'},
            timeout=timeout,
        )
        # Authorize.Net can return 200 even for errors
        data = response.json()
        # Strip UTF-8 BOM some responses include
        return data

    # -----------------------------------------------------------------
    # PRIVATE: Convert raw Authorize.Net response → PaymentResult
    # -----------------------------------------------------------------
    def _parse_charge_response(self, data: dict) -> PaymentResult:
        messages   = data.get('messages', {})
        result_code = messages.get('resultCode')
        txn_resp   = data.get('transactionResponse', {})
        resp_code  = txn_resp.get('responseCode')

        if result_code == 'Ok' and resp_code == '1':
            return PaymentResult(
                success=True,
                transaction_id=txn_resp.get('transId'),
                auth_code=txn_resp.get('authCode'),
                response_code=resp_code,
                full_response=data,
            )

        # Build a user-friendly error message
        error_text = 'Payment declined'
        errors = txn_resp.get('errors', [])
        if errors:
            error_text = errors[0].get('errorText', error_text)
        elif messages.get('message'):
            error_text = messages['message'][0].get('text', error_text)

        return PaymentResult(
            success=False,
            transaction_id=txn_resp.get('transId'),
            response_code=resp_code,
            error=error_text,
            full_response=data,
        )

    # -----------------------------------------------------------------
    # PUBLIC: charge (authorize + capture)
    # -----------------------------------------------------------------
    def charge(self, request: PaymentRequest) -> PaymentResult:
        """
        Authorize AND capture a payment using Authorize.Net Accept.js opaque data.
        Falls back to mock mode if credentials are missing (for sandbox testing).
        """
        if self._mock_mode:
            logger.warning(
                "MOCK MODE: Authorize.Net credentials not set. Returning mock success."
            )
            return PaymentResult(
                success=True,
                transaction_id=f'mock_{uuid.uuid4().hex[:8]}',
                auth_code='MOCK123',
                response_code='1',
                full_response={'message': 'MOCK SUCCESS — no API credentials configured'},
            )

        payload = {
            'createTransactionRequest': {
                'merchantAuthentication': self.merchant_auth,
                'refId': request.ref_id or str(request.correlation_id)[:20],
                'transactionRequest': {
                    'transactionType': 'authCaptureTransaction',
                    'amount': str(request.amount),
                    'payment': {
                        'opaqueData': {
                            'dataDescriptor': 'COMMON.ACCEPT.INAPP.PAYMENT',
                            'dataValue': request.nonce,
                        }
                    },
                    'order': {
                        'invoiceNumber': request.ref_id[:20] if request.ref_id else '',
                        'description': request.description[:255] if request.description else '',
                    },
                    'customerIP': request.metadata.get('ip_address', ''),
                }
            }
        }

        try:
            data = self._post(payload)
            result = self._parse_charge_response(data)
            if not result.success:
                logger.warning(
                    "Authorize.Net charge failed: %s (txn=%s)",
                    result.error, result.transaction_id
                )
            return result
        except requests.Timeout:
            logger.error("Authorize.Net charge timed out for correlation_id=%s", request.correlation_id)
            return PaymentResult(
                success=False,
                error='Payment gateway timed out. Please try again.',
                full_response=None,
            )
        except Exception as exc:
            logger.exception("Unexpected error in Authorize.Net charge: %s", exc)
            return PaymentResult(
                success=False,
                error='An unexpected error occurred. Please contact support.',
                full_response={'exception': str(exc)},
            )

    # -----------------------------------------------------------------
    # PUBLIC: refund
    # -----------------------------------------------------------------
    def refund(self, transaction_id: str, amount: Decimal, card_last_four: str = '') -> PaymentResult:
        if self._mock_mode:
            return PaymentResult(
                success=True,
                transaction_id=f'mock_refund_{uuid.uuid4().hex[:8]}',
                full_response={'message': 'MOCK REFUND'},
            )

        payload = {
            'createTransactionRequest': {
                'merchantAuthentication': self.merchant_auth,
                'transactionRequest': {
                    'transactionType': 'refundTransaction',
                    'amount': str(amount),
                    'payment': {
                        'creditCard': {
                            'cardNumber': card_last_four or '0000',
                            'expirationDate': 'XXXX',
                        }
                    },
                    'refTransId': transaction_id,
                }
            }
        }

        try:
            data = self._post(payload)
            return self._parse_charge_response(data)
        except Exception as exc:
            logger.exception("Refund failed for txn=%s: %s", transaction_id, exc)
            return PaymentResult(success=False, error=str(exc))

    # -----------------------------------------------------------------
    # PUBLIC: void
    # -----------------------------------------------------------------
    def void(self, transaction_id: str) -> PaymentResult:
        if self._mock_mode:
            return PaymentResult(
                success=True,
                transaction_id=transaction_id,
                full_response={'message': 'MOCK VOID'},
            )

        payload = {
            'createTransactionRequest': {
                'merchantAuthentication': self.merchant_auth,
                'transactionRequest': {
                    'transactionType': 'voidTransaction',
                    'refTransId': transaction_id,
                }
            }
        }

        try:
            data = self._post(payload)
            return self._parse_charge_response(data)
        except Exception as exc:
            logger.exception("Void failed for txn=%s: %s", transaction_id, exc)
            return PaymentResult(success=False, error=str(exc))

    # -----------------------------------------------------------------
    # PUBLIC: webhook signature verification
    # -----------------------------------------------------------------
    def verify_webhook_signature(self, payload: bytes, headers: dict) -> bool:
        """
        Verify the X-ANET-Signature header from Authorize.Net webhooks.
        Uses HMAC-SHA512 with the Signature Key.
        """
        if not self.signature_key:
            logger.warning("No AUTHORIZENET_SIGNATURE_KEY set — skipping webhook signature verification.")
            return True  # Allow in dev; enforce in production by setting the key

        expected_header = headers.get('X-ANET-Signature', headers.get('x-anet-signature', ''))
        if not expected_header or not expected_header.startswith('sha512='):
            logger.error("Webhook received without valid X-ANET-Signature header.")
            return False

        signature = expected_header[len('sha512='):]

        computed = hmac.new(
            self.signature_key.encode('utf-8'),
            payload,
            hashlib.sha512,
        ).hexdigest().upper()

        is_valid = hmac.compare_digest(computed, signature.upper())
        if not is_valid:
            logger.error("Webhook signature mismatch!")
        return is_valid
