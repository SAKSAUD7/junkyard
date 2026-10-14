from django.test import TestCase
from rest_framework.test import APIClient

from apps.cms.models import SiteContent
from apps.users.models import User

BULK_URL = "/api/cms/admin/content/bulk/"
PASSWORD = "Str0ng-test-pass-99"


class CMSBulkUpdateTests(TestCase):
    """POST /api/cms/admin/content/bulk/

    The loop only caught SiteContent.DoesNotExist, so a non-numeric id raised
    ValueError out of `.get(pk=...)` and the whole batch answered 500.
    """

    def setUp(self):
        self.client = APIClient()
        self.staff = self.make_staff("cms-staff@example.com")
        self.client.force_authenticate(self.staff)
        self.row = SiteContent.objects.create(
            page="faq", key="bulk_test_key", value="old value", label="Bulk test"
        )

    def make_staff(self, email):
        return User.objects.create_user(
            username=email.split("@")[0], email=email, password=PASSWORD, is_staff=True
        )

    def bulk(self, updates):
        return self.client.post(BULK_URL, {"updates": updates}, format="json")

    def test_non_numeric_id_is_reported_instead_of_crashing(self):
        response = self.bulk([{"id": "abc", "value": "new"}])
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data["updated"], 0)
        self.assertEqual(response.data["errors"][0]["error"], "Invalid id")

    def test_missing_row_is_reported_instead_of_crashing(self):
        response = self.bulk([{"id": 999999, "value": "new"}])
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data["errors"][0]["error"], "Not found")

    def test_one_bad_id_does_not_block_the_good_ones(self):
        response = self.bulk([
            {"id": "abc", "value": "new"},
            {"id": self.row.pk, "value": "updated value"},
        ])
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data["updated"], 1)
        self.row.refresh_from_db()
        self.assertEqual(self.row.value, "updated value")

    def test_empty_updates_is_a_400(self):
        self.assertEqual(self.bulk([]).status_code, 400)

    def test_anonymous_caller_cannot_bulk_update(self):
        self.client.force_authenticate(None)
        self.assertIn(self.bulk([{"id": self.row.pk, "value": "x"}]).status_code, (401, 403))
