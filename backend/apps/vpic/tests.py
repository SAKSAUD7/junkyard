from django.test import TestCase
from rest_framework.test import APIClient

DECODE_URL = "/api/vin/decode/"


class VinDecodeInputTests(TestCase):
    """POST /api/vin/decode/ is public (no auth, no permission classes).

    `request.data.get('vin', '').strip()` assumed a string, so a JSON number,
    a list, or a non-object body raised AttributeError and answered 500. Only
    malformed input is exercised here: a well-formed VIN would call out to the
    external VPIC service.
    """

    def setUp(self):
        self.client = APIClient()

    def decode(self, body):
        return self.client.post(DECODE_URL, body, format="json")

    def test_numeric_vin_is_a_400(self):
        response = self.decode({"vin": 123})
        self.assertEqual(response.status_code, 400)
        self.assertFalse(response.json()["success"])

    def test_list_vin_is_a_400(self):
        self.assertEqual(self.decode({"vin": ["1HGBH41JXMN109186"]}).status_code, 400)

    def test_non_object_body_is_a_400(self):
        self.assertEqual(self.decode(["not", "an", "object"]).status_code, 400)

    def test_missing_vin_is_a_400(self):
        response = self.decode({})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["error"], "VIN is required")

    def test_wrong_length_is_a_400(self):
        self.assertEqual(self.decode({"vin": "abc"}).status_code, 400)

    def test_forbidden_characters_are_a_400(self):
        response = self.decode({"vin": "1HGBH41JXMN1O9186"})
        self.assertEqual(response.status_code, 400)
        self.assertIn("I, O, or Q", response.json()["error"])
