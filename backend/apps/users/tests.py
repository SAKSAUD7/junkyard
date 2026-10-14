from django.test import TestCase
from rest_framework.test import APIClient

from apps.users.models import User

PASSWORD = "Str0ng-test-pass-99"


def payload(email, username, **extra):
    data = {"email": email, "username": username, "password": PASSWORD, "password2": PASSWORD}
    data.update(extra)
    return data


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
