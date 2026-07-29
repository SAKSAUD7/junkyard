"""
Payment Provider Abstraction Layer
===================================
Defines the interface that all payment gateways must implement.
Swap Authorize.Net for Stripe, PayPal, or Square by creating a new
class that extends BasePaymentProvider — zero business logic changes required.
"""
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Optional, Dict, Any
from decimal import Decimal


@dataclass
class PaymentResult:
    """
    Standardized result object returned by every provider, regardless of gateway.
    """
    success: bool
    transaction_id: Optional[str] = None
    auth_code: Optional[str] = None
    response_code: Optional[str] = None
    error: Optional[str] = None
    full_response: Optional[Dict[str, Any]] = None
    risk_score: int = 0


@dataclass
class PaymentRequest:
    """
    Standardized payment request passed into every provider.
    """
    nonce: str               # Opaque data / payment token from the frontend
    amount: Decimal
    correlation_id: str      # UUID for cross-system tracing
    ref_id: str = ''         # Internal reference (e.g. "TXN_42")
    description: str = ''
    customer_email: str = ''
    metadata: Dict[str, Any] = field(default_factory=dict)


class BasePaymentProvider(ABC):
    """
    Abstract base class every payment gateway must implement.
    Never instantiate this directly.
    """
    GATEWAY_NAME: str = 'unknown'

    @abstractmethod
    def charge(self, request: PaymentRequest) -> PaymentResult:
        """
        Authorize AND capture a payment in one call (authCapture).
        Returns a standardized PaymentResult.
        """
        raise NotImplementedError

    @abstractmethod
    def refund(self, transaction_id: str, amount: Decimal, card_last_four: str = '') -> PaymentResult:
        """
        Refund all or part of a previously captured transaction.
        """
        raise NotImplementedError

    @abstractmethod
    def void(self, transaction_id: str) -> PaymentResult:
        """
        Void an authorized-but-not-yet-settled transaction.
        """
        raise NotImplementedError

    def verify_webhook_signature(self, payload: bytes, headers: dict) -> bool:
        """
        Verify that an inbound webhook was genuinely sent by the gateway.
        Override in subclasses that support webhook signing.
        Default returns True (no verification) — not suitable for production.
        """
        return True

    def get_transaction_status(self, transaction_id: str) -> Optional[Dict[str, Any]]:
        """
        Fetch the current status of a transaction directly from the gateway.
        Used for reconciliation when webhook is delayed.
        """
        return None
