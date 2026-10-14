from datetime import date
from unittest import mock

from django.core.cache import cache
from django.core import mail
from django.db.utils import OperationalError
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

from apps.hollander.models import Vendor
from apps.leads.models import Lead
from apps.leads.serializers import LeadSerializer


class LeadCreateSourceTrackingTests(TestCase):
    """Tests for Phase 2 — Lead source tracking fields."""

    def setUp(self):
        self.client = APIClient()

    def test_lead_create_sets_source_type(self):
        """POST /api/leads/ with source_type=HOMEPAGE_QUOTE stores it correctly."""
        response = self.client.post('/api/leads/', {
            'make': 'Ford',
            'model': 'F-150',
            'year': 2018,
            'part': 'Engine',
            'name': 'Test User',
            'email': 'test@example.com',
            'phone': '5551234567',
            'state': 'TX',
            'zip': '75001',
            'lead_type': 'quality_auto_parts',
            'source_type': 'HOMEPAGE_QUOTE',
            'source_page_url': 'http://localhost/',
            'source_component': 'HeroSection',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['source_type'], 'HOMEPAGE_QUOTE')
        self.assertEqual(response.data['source_component'], 'HeroSection')

    def test_lead_create_bad_originating_vendor_is_null(self):
        """POST with originating_vendor=99999 creates the lead with originating_vendor=null (no 500)."""
        response = self.client.post('/api/leads/', {
            'make': 'Toyota',
            'model': 'Camry',
            'year': 2020,
            'part': 'Alternator',
            'name': 'Jane Doe',
            'email': 'jane@example.com',
            'phone': '5559876543',
            'state': 'CA',
            'zip': '90210',
            'lead_type': 'quality_auto_parts',
            'source_type': 'VENDOR_LISTING_INQUIRY',
            'originating_vendor': 99999,
        }, format='json')
        # Should succeed (201) and silently ignore the bad vendor FK
        self.assertIn(response.status_code, [status.HTTP_201_CREATED, status.HTTP_400_BAD_REQUEST])
        if response.status_code == status.HTTP_201_CREATED:
            self.assertIsNone(response.data.get('originating_vendor'))

    def test_lead_create_defaults_source_type_to_other(self):
        """POST without source_type defaults to 'OTHER'."""
        response = self.client.post('/api/leads/', {
            'make': 'Honda',
            'model': 'Civic',
            'year': 2019,
            'part': 'Bumper',
            'name': 'Bob Smith',
            'email': 'bob@example.com',
            'phone': '5550001111',
            'state': 'FL',
            'zip': '33101',
            'lead_type': 'quality_auto_parts',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['source_type'], 'OTHER')


def hero_payload(**overrides):
    """Mirror of the JSON that frontend/src/components/home/HeroSection.jsx posts."""
    payload = {
        'make': 'Ford',
        'model': 'F-150',
        'year': 2018,
        'part': 'Engine',
        'name': 'Hero Tester',
        'email': 'hero@example.com',
        'phone': '5551234567',
        'state': 'TX',
        'zip': '75001',
        'lead_type': 'quality_auto_parts',
        'source_type': 'HOMEPAGE_QUOTE',
        'source_page_url': 'https://2.25.151.68/',
        'source_component': 'HeroSection',
    }
    payload.update(overrides)
    return payload


class LeadSubmissionRegressionTests(TestCase):
    """Regression coverage for the HTTP 500 seen on the deployed homepage form."""

    def setUp(self):
        self.client = APIClient()
        # lead_submit is throttled to 10/hour per IP; the cache counter is
        # process-wide, so clear it instead of asserting on throttling here.
        cache.clear()

    def test_homepage_payload_persists_and_returns_201(self):
        response = self.client.post('/api/leads/', hero_payload(), format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        lead = Lead.objects.get(pk=response.data['id'])
        self.assertEqual(lead.source_type, 'HOMEPAGE_QUOTE')
        self.assertEqual(lead.source_component, 'HeroSection')
        self.assertEqual(lead.year, 2018)
        self.assertEqual(lead.make, 'Ford')

    def test_year_beyond_int32_returns_400_not_500(self):
        """Lead.year is a plain IntegerField; unchecked values overflow on Postgres."""
        for bad_year in (3000000000, 1900 - 1, 'not-a-year'):
            response = self.client.post('/api/leads/', hero_payload(year=bad_year), format='json')
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST, bad_year)
            self.assertIn('year', response.data)

    def test_year_beyond_model_year_ceiling_returns_400(self):
        response = self.client.post(
            '/api/leads/', hero_payload(year=date.today().year + 6), format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_blank_vehicle_fields_return_400(self):
        """Whitespace-only make/model/part used to pass validation and store empty rows."""
        for field in ('make', 'model', 'part'):
            response = self.client.post('/api/leads/', hero_payload(**{field: '   '}), format='json')
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST, field)
            self.assertIn(field, response.data)

    def test_cleaned_vehicle_fields_are_stored(self):
        response = self.client.post(
            '/api/leads/', hero_payload(make='  Toyota  ', part=' Alternator '), format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        lead = Lead.objects.get(pk=response.data['id'])
        self.assertEqual((lead.make, lead.part), ('Toyota', 'Alternator'))

    def test_broken_duplicate_check_does_not_lose_the_lead(self):
        """An unapplied migration makes the dup query raise; the lead must still save."""
        real_filter = Lead.objects.filter

        def flaky_filter(*args, **kwargs):
            if 'part__iexact' in kwargs:
                raise OperationalError('column leads_lead.source_type does not exist')
            return real_filter(*args, **kwargs)

        with mock.patch.object(Lead.objects, 'filter', new=flaky_filter):
            response = self.client.post('/api/leads/', hero_payload(), format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Lead.objects.filter(email='hero@example.com').exists())

    def test_duplicate_within_24h_is_rejected_with_429(self):
        first = self.client.post('/api/leads/', hero_payload(), format='json')
        self.assertEqual(first.status_code, status.HTTP_201_CREATED)
        second = self.client.post('/api/leads/', hero_payload(), format='json')
        self.assertEqual(second.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
        self.assertEqual(Lead.objects.filter(email='hero@example.com').count(), 1)

    def test_insert_failure_returns_logged_reference_not_a_bare_500(self):
        with self.assertLogs('apps.leads.views', level='ERROR') as logs:
            with mock.patch.object(
                LeadSerializer, 'save',
                side_effect=OperationalError('column leads_lead.source_type does not exist'),
            ):
                response = self.client.post('/api/leads/', hero_payload(), format='json')

        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertIn('Reference', response.data['detail'])
        joined = '\n'.join(logs.output)
        self.assertIn('Lead insert failed', joined)
        self.assertIn('Traceback', joined)

    def test_admin_gets_one_notification_when_signal_succeeded(self):
        """The post_save signal owns the HTML admin mail; the view must not copy it."""
        with mock.patch('apps.leads.signals.send_lead_notification', return_value=True):
            response = self.client.post('/api/leads/', hero_payload(), format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        admin_mails = [m for m in mail.outbox if 'leads@test.local' in m.to]
        self.assertEqual(len(admin_mails), 0)
        customer_mails = [m for m in mail.outbox if 'hero@example.com' in m.to]
        self.assertEqual(len(customer_mails), 1)

    def test_admin_fallback_notification_when_signal_failed(self):
        with mock.patch('apps.leads.signals.send_lead_notification', return_value=False):
            response = self.client.post('/api/leads/', hero_payload(), format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        admin_mails = [m for m in mail.outbox if 'leads@test.local' in m.to]
        self.assertEqual(len(admin_mails), 1)
        self.assertIn('NEW LEAD', admin_mails[0].subject)


class LeadPublicContractTests(TestCase):
    """What a public POST /api/leads/ is allowed to decide for itself."""

    def setUp(self):
        self.client = APIClient()
        cache.clear()
        self.vendor = Vendor.objects.create(yard_id=501, name="Contract Yard", state="TX")

    def test_public_submission_cannot_assign_its_lead_to_a_vendor(self):
        """Lead.vendor is the admin-side assignment column."""
        response = self.client.post(
            '/api/leads/',
            hero_payload(email='no-assign@example.com', vendor=self.vendor.pk),
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        lead = Lead.objects.get(pk=response.data['id'])
        self.assertIsNone(lead.vendor)

    def test_hollander_candidates_are_stored(self):
        """LeadForm sends them; the serializer used to drop them silently."""
        response = self.client.post(
            '/api/leads/',
            hero_payload(
                email='with-candidates@example.com',
                hollander_number='100-10138A',
                hollander_candidates=['100-10138A', '100-10138B'],
            ),
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        lead = Lead.objects.get(pk=response.data['id'])
        self.assertEqual(lead.hollander_candidates, ['100-10138A', '100-10138B'])

    def test_lead_without_candidates_defaults_to_empty_list(self):
        response = self.client.post(
            '/api/leads/', hero_payload(email='no-candidates@example.com'), format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertEqual(Lead.objects.get(pk=response.data['id']).hollander_candidates, [])
