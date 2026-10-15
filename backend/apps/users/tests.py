from django.core import mail
from django.test import TestCase, override_settings
from unittest.mock import patch
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework.test import APIClient

from apps.users.models import User

PASSWORD = "Str0ng-test-pass-99"


def payload(email, username, **extra):
    data = {"email": email, "username": username, "password": PASSWORD, "password2": PASSWORD}
    data.update(extra)
    return data


@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend", FRONTEND_URL="https://junkyardsnearme.com")
class PasswordResetFlowTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="reset-buyer", email="reset-buyer@example.com", password=PASSWORD
        )
        self.vendor = User.objects.create_user(
            username="reset-vendor", email="reset-vendor@example.com", password=PASSWORD, user_type="vendor"
        )
        self.admin = User.objects.create_user(
            username="reset-admin", email="reset-admin@example.com", password=PASSWORD, is_staff=True, user_type="admin"
        )

    def test_unknown_email_is_generic_and_sends_no_message(self):
        response = self.client.post("/api/auth/password-reset/", {"email": "unknown@example.com", "account_type": "customer"}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertIn("If an account exists", response.data["message"])
        self.assertEqual(len(mail.outbox), 0)

    def test_customer_reset_sends_branded_message_without_exposing_token(self):
        response = self.client.post("/api/auth/password-reset/", {"email": "RESET-BUYER@EXAMPLE.COM", "account_type": "customer"}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("JYNM", mail.outbox[0].body)
        self.assertEqual(mail.outbox[0].alternatives[0][1], "text/html")
        self.assertNotIn("reset_link", mail.outbox[0].body)

    def test_account_type_separation_is_enforced(self):
        response = self.client.post("/api/auth/password-reset/", {"email": self.user.email, "account_type": "vendor"}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 0)

    @patch("apps.users.password_reset.EmailMultiAlternatives.send", side_effect=OSError("provider unavailable"))
    def test_provider_failure_is_not_reported_as_success(self, _send):
        response = self.client.post("/api/auth/password-reset/", {"email": self.user.email, "account_type": "customer"}, format="json")
        self.assertEqual(response.status_code, 503)
        self.assertNotIn("reset", response.data.get("message", "").lower())

    def test_reset_token_changes_password_and_is_single_use(self):
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = default_token_generator.make_token(self.user)
        payload = {"account_type": "customer", "uid": uid, "token": token, "new_password": "New-str0ng-password-99"}
        first = self.client.post("/api/auth/password-reset-confirm/", payload, format="json")
        self.assertEqual(first.status_code, 200, first.data)
        self.assertTrue(self.user.__class__.objects.get(pk=self.user.pk).check_password(payload["new_password"]))
        second = self.client.post("/api/auth/password-reset-confirm/", payload, format="json")
        self.assertEqual(second.status_code, 400)


class AccountTypeLoginTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.customer = User.objects.create_user(username="login-customer", email="login-customer@example.com", password=PASSWORD)
        self.admin = User.objects.create_user(username="login-admin", email="login-admin@example.com", password=PASSWORD, is_staff=True, user_type="admin")

    def test_customer_cannot_request_vendor_or_admin_session(self):
        vendor = self.client.post("/api/auth/login/", {"email": self.customer.email, "password": PASSWORD, "account_type": "vendor"}, format="json")
        admin = self.client.post("/api/auth/login/", {"email": self.customer.email, "password": PASSWORD, "account_type": "admin"}, format="json")
        self.assertEqual(vendor.status_code, 403)
        self.assertEqual(admin.status_code, 403)

    def test_admin_session_requires_admin_account(self):
        response = self.client.post("/api/auth/login/", {"email": self.admin.email, "password": PASSWORD, "account_type": "admin"}, format="json")
        self.assertEqual(response.status_code, 200, response.data)


class SelfServiceProfilePermissionTests(TestCase):
    """Every authenticated account can PATCH its own profile, so the
    privilege-bearing fields must not be writable through it."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="buyer-1", email="buyer1@example.com", password=PASSWORD
        )
        self.client.force_authenticate(self.user)

    def test_profile_fields_are_still_writable(self):
        response = self.client.patch(
            "/api/auth/me/", {"first_name": "Nina", "phone": "+15551234567"}, format="json"
        )
        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, "Nina")
        self.assertEqual(self.user.phone, "+15551234567")

    def test_privilege_fields_are_ignored_on_patch(self):
        response = self.client.patch(
            "/api/auth/me/",
            {"is_staff": True, "is_superuser": True, "user_type": "admin"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertFalse(self.user.is_staff)
        self.assertFalse(self.user.is_superuser)
        self.assertEqual(self.user.user_type, "customer")

    def test_privilege_fields_are_ignored_on_put(self):
        response = self.client.put(
            "/api/auth/me/",
            {"username": "buyer-1", "first_name": "Nina", "is_staff": True, "user_type": "admin"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertFalse(self.user.is_staff)
        self.assertEqual(self.user.user_type, "customer")

    def test_email_is_not_self_service_writable(self):
        """email is USERNAME_FIELD; changing it is an ownership-sensitive action."""
        self.client.patch("/api/auth/me/", {"email": "attacker@example.com"}, format="json")
        self.user.refresh_from_db()
        self.assertEqual(self.user.email, "buyer1@example.com")

    def test_profile_self_promotion_does_not_unlock_admin_analytics(self):
        response = self.client.patch(
            "/api/auth/me/", {"is_staff": True, "user_type": "admin"}, format="json"
        )
        self.assertEqual(response.status_code, 200)
        forbidden = self.client.get("/api/common/site-analytics/summary/")
        self.assertEqual(forbidden.status_code, 403)


class PublicRegistrationTests(TestCase):
    """POST /api/auth/register/ is AllowAny."""

    URL = "/api/auth/register/"

    def setUp(self):
        self.client = APIClient()

    def register(self, user_type, email=None):
        email = email or f"signup-{user_type}@example.com"
        return self.client.post(
            self.URL, payload(email, email.split("@")[0], user_type=user_type), format="json"
        ), email

    def test_buyer_role_from_the_signup_page_creates_a_customer(self):
        """/signup sends user_type='buyer'; the model choice is 'customer'."""
        response, email = self.register("buyer")
        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual(response.data["user"]["user_type"], "customer")
        self.assertEqual(User.objects.get(email=email).user_type, "customer")

    def test_customer_and_vendor_roles_are_accepted(self):
        for user_type in ("customer", "vendor"):
            response, _ = self.register(user_type)
            self.assertEqual(response.status_code, 201, response.data)
            self.assertEqual(response.data["user"]["user_type"], user_type)

    def test_admin_role_cannot_be_self_registered(self):
        response, email = self.register("admin")
        self.assertEqual(response.status_code, 400)
        self.assertIn("user_type", response.data)
        self.assertFalse(User.objects.filter(email=email).exists())

    def test_missing_user_type_defaults_to_customer(self):
        """The vendor signup page omits user_type entirely."""
        response = self.client.post(
            self.URL, payload("no-role@example.com", "no-role"), format="json"
        )
        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual(response.data["user"]["user_type"], "customer")
