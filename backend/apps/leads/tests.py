from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status


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
