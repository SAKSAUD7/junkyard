"""Shared password-reset request and confirmation endpoints for JYNM accounts."""

import logging

from django.conf import settings
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError
from django.core.mail import EmailMultiAlternatives
from django.core.validators import validate_email
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import User

logger = logging.getLogger(__name__)

GENERIC_MESSAGE = "If an account exists for that email address, reset instructions will be sent shortly."
VALID_ACCOUNT_TYPES = {"customer", "vendor", "admin"}


def _normalise_email(value):
    email = str(value or "").strip().lower()
    try:
        validate_email(email)
    except ValidationError:
        return None
    return email


def _is_allowed_account(user, account_type):
    if account_type == "admin":
        return user.is_staff or user.is_superuser or user.user_type == "admin"
    return user.user_type == account_type


def _reset_url(account_type, uid, token):
    base_url = getattr(settings, "FRONTEND_URL", "https://junkyardsnearme.com").rstrip("/")
    return f"{base_url}/reset-password/{account_type}/{uid}/{token}"


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = _normalise_email(request.data.get("email"))
        account_type = str(request.data.get("account_type") or "customer").strip().lower()
        if not email or account_type not in VALID_ACCOUNT_TYPES:
            return Response({"error": "Enter a valid email address."}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email__iexact=email).first()
        if not user or not _is_allowed_account(user, account_type):
            return Response({"message": GENERIC_MESSAGE}, status=status.HTTP_200_OK)

        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        reset_link = _reset_url(account_type, uid, token)
        context = {
            "user": user,
            "reset_link": reset_link,
            "account_type": account_type,
            "timeout_hours": max(1, int(getattr(settings, "PASSWORD_RESET_TIMEOUT", 86400) / 3600)),
        }

        try:
            text_body = render_to_string("users/password_reset_email.txt", context)
            html_body = render_to_string("users/password_reset_email.html", context)
            message = EmailMultiAlternatives(
                subject="Reset your JYNM password",
                body=text_body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[user.email],
            )
            message.attach_alternative(html_body, "text/html")
            message.send(fail_silently=False)
        except Exception:
            # Never log the token or reset URL. The response is generic, but a provider
            # failure must not be presented as a successful delivery.
            logger.exception("Password-reset email provider failure")
            return Response(
                {"error": "We could not send reset instructions right now. Please try again later."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response({"message": GENERIC_MESSAGE}, status=status.HTTP_200_OK)


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        uid = request.data.get("uid")
        token = request.data.get("token")
        account_type = str(request.data.get("account_type") or "customer").strip().lower()
        new_password = request.data.get("new_password")
        if not uid or not token or account_type not in VALID_ACCOUNT_TYPES or not new_password:
            return Response({"error": "Invalid or incomplete reset request."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({"error": "Invalid or expired reset link."}, status=status.HTTP_400_BAD_REQUEST)

        if not _is_allowed_account(user, account_type) or not default_token_generator.check_token(user, token):
            return Response({"error": "Invalid or expired reset link."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            validate_password(new_password, user)
        except ValidationError as error:
            return Response({"new_password": list(error.messages)}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save(update_fields=["password", "updated_at"])
        # Django's token generator incorporates password and last_login, so changing
        # the password invalidates this token and makes it single-use.
        return Response({"message": "Password reset successful. You can now sign in."}, status=status.HTTP_200_OK)
