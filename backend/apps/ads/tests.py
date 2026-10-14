from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from apps.ads.models import Advertisement
from django.utils import timezone
import datetime


class AdImpressionViewTests(TestCase):
    """Tests for POST /api/ads/<pk>/impression/"""

    def setUp(self):
        self.client = APIClient()
        today = timezone.now().date()
        self.ad = Advertisement.objects.create(
            title="Test Ad",
            is_active=True,
            start_date=today - datetime.timedelta(days=1),
            end_date=today + datetime.timedelta(days=30),
            slot="strip_top",
            redirect_url="https://example.com",
            impressions=0,
            clicks=0,
        )

    def _url(self, pk):
        return f"/api/ads/{pk}/impression/"

    # ── DEFECT-1 regression: pk ≤ 0 must return 400, not 500 ──────────────
    def test_impression_negative_pk_returns_400(self):
        """Guard against malformed pk=-1 sent by frontend race condition."""
        response = self.client.post(self._url(-1))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["status"], "ignored")

    def test_impression_zero_pk_returns_400(self):
        response = self.client.post(self._url(0))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # ── Non-existent ad must return 404, not 500 ──────────────────────────
    def test_impression_nonexistent_ad_returns_404(self):
        response = self.client.post(self._url(999999))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_impression_404_body_is_the_client_contract(self):
        """AdCarousel drops the stale card only when this exact JSON is returned."""
        response = self.client.post(self._url(999999))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.json(), {"status": "not_found"})
        self.assertEqual(self.ad.impressions, 0)

    # ── Happy path ────────────────────────────────────────────────────────
    def test_impression_valid_ad_increments_counter(self):
        """Successful impression increments the counter and returns 200."""
        response = self.client.post(self._url(self.ad.pk))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "ok")
        self.ad.refresh_from_db()
        self.assertEqual(self.ad.impressions, 1)

    def test_impression_dedup_same_session(self):
        """Same session key should NOT double-count impressions."""
        session_header = {"HTTP_X_AD_SESSION": "test-session-abc123"}
        self.client.post(self._url(self.ad.pk), **session_header)
        self.client.post(self._url(self.ad.pk), **session_header)
        self.ad.refresh_from_db()
        # Only 1 impression despite 2 POSTs with same session
        self.assertEqual(self.ad.impressions, 1)

    def test_impression_different_sessions_count_separately(self):
        """Different session keys should each count once."""
        self.client.post(self._url(self.ad.pk), **{"HTTP_X_AD_SESSION": "session-A"})
        self.client.post(self._url(self.ad.pk), **{"HTTP_X_AD_SESSION": "session-B"})
        self.ad.refresh_from_db()
        self.assertEqual(self.ad.impressions, 2)
