from django.test import TestCase
from rest_framework.test import APIClient

from apps.hollander.models import Vendor
from apps.leads.models import Lead, VendorLead
from apps.users.models import User
from apps.users.models import VendorProfile

PASSWORD = "Str0ng-test-pass-99"


def make_lead(state, name):
    return Lead.objects.create(
        make="Toyota", model="Corolla", year=2015, part="Alternator",
        name=name, email=f"{name.lower()}@example.com", phone="+15550000000",
        state=state, zip="00000",
    )


def make_vendor_user(email, yard_id, state):
    vendor = Vendor.objects.create(yard_id=yard_id, name=f"{state} Yard", state=state, is_active=True)
    user = User.objects.create_user(
        username=email.split("@")[0], email=email, password=PASSWORD, user_type="vendor"
    )
    VendorProfile.objects.create(user=user, vendor=vendor, is_owner=True)
    return user, vendor


class VendorLeadDetailAccessTests(TestCase):
    """GET/PATCH /api/vendor/leads/<pk>/ is dead for every vendor account.

    IsVendorOwner.has_object_permission tests `hasattr(obj, 'vendor')` before
    its Lead branch, and Lead grew a `vendor` FK, so every lead is measured
    against an assignment that the disabled distribution system never creates —
    the route answers 403 even for a lead in the vendor's own state. These
    tests pin the current behaviour; reopening the route is a lead-assignment
    decision, not a security fix.
    """

    def setUp(self):
        self.client = APIClient()
        self.tx_user, self.tx_vendor = make_vendor_user("tx-vendor@example.com", 1, "TX")
        self.ia_user, _ = make_vendor_user("ia-vendor@example.com", 2, "IA")
        self.tx_lead = make_lead("TX", "Texan")
        self.ia_lead = make_lead("IA", "Iowan")

    def _url(self, pk):
        return f"/api/vendor/leads/{pk}/"

    def test_own_state_lead_is_denied_too(self):
        self.client.force_authenticate(self.tx_user)
        response = self.client.get(self._url(self.tx_lead.pk))
        self.assertEqual(response.status_code, 403, response.data)

    def test_other_state_lead_is_denied(self):
        self.client.force_authenticate(self.tx_user)
        response = self.client.get(self._url(self.ia_lead.pk))
        self.assertEqual(response.status_code, 403, response.data)

    def test_status_update_is_denied(self):
        self.client.force_authenticate(self.tx_user)
        response = self.client.patch(
            self._url(self.tx_lead.pk), {"status": "closed"}, format="json"
        )
        self.assertEqual(response.status_code, 403, response.data)
        self.tx_lead.refresh_from_db()
        self.assertEqual(self.tx_lead.status, "new")

    def test_assigned_lead_is_reachable(self):
        """The one case the object check does admit."""
        self.tx_lead.vendor = self.tx_vendor
        self.tx_lead.save()
        self.client.force_authenticate(self.tx_user)
        response = self.client.get(self._url(self.tx_lead.pk))
        self.assertEqual(response.status_code, 200, response.data)

    def test_anonymous_caller_is_rejected(self):
        response = self.client.get(self._url(self.tx_lead.pk))
        self.assertEqual(response.status_code, 401)

    def test_customer_account_is_rejected(self):
        customer = User.objects.create_user(
            username="plain-customer", email="plain@example.com", password=PASSWORD
        )
        self.client.force_authenticate(customer)
        response = self.client.get(self._url(self.tx_lead.pk))
        self.assertEqual(response.status_code, 403)


class VendorLeadListTests(TestCase):
    """GET /api/vendor/leads/ — state-based visibility, the documented rule."""

    def setUp(self):
        self.client = APIClient()
        self.tx_user, self.tx_vendor = make_vendor_user("tx-list@example.com", 11, "TX")
        VendorLead.objects.create(name="One", email="one@example.com", phone="+15550000001", state="TX", make="Toyota", model="Corolla", year=2015)
        VendorLead.objects.create(name="Two", email="two@example.com", phone="+15550000002", state="TX", make="Honda", model="Civic", year=2016)
        VendorLead.objects.create(name="Three", email="three@example.com", phone="+15550000003", state="IA", make="Ford", model="F150", year=2017)

    def test_list_returns_only_own_state_records(self):
        self.client.force_authenticate(self.tx_user)
        response = self.client.get("/api/vendor/leads/")
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data["count"], 2, response.data)
        self.assertEqual({row["state"] for row in response.data["results"]}, {"TX"})
