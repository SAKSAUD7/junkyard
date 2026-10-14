from datetime import timedelta

from django.core.cache import cache
from django.http import HttpResponse, HttpResponseNotFound
from django.test import RequestFactory, TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from apps.common.middleware import CustomRedirectMiddleware
from apps.common.models import CustomRedirect, SiteAnalytics
from apps.users.models import User


class CustomRedirectMiddlewareTests(TestCase):
    """Tests for the legacy-URL 301/302 fallback middleware.

    process_response() is exercised directly with a RequestFactory so the
    assertions cover the middleware's matching rules rather than the URL conf.
    """

    def setUp(self):
        self.factory = RequestFactory()

        def not_found(request):
            return HttpResponseNotFound()

        self.middleware = CustomRedirectMiddleware(not_found)

    def _call(self, path):
        return self.middleware(self.factory.get(path))

    def test_exact_path_hit_returns_301(self):
        CustomRedirect.objects.create(
            old_path='/junkyards/wisconsin/9999880-kadinger-salvage-inc-downing-wi',
            new_path='/junkyards/wi/9999880-kadinger-salvage-inc-downing-wi',
            status_code=301)
        response = self._call(
            '/junkyards/wisconsin/9999880-kadinger-salvage-inc-downing-wi')
        self.assertEqual(response.status_code, 301)
        self.assertEqual(
            response['Location'],
            '/junkyards/wi/9999880-kadinger-salvage-inc-downing-wi')

    def test_query_string_is_matched_before_bare_path(self):
        CustomRedirect.objects.create(
            old_path='/junkyards/ohio?ref=seo', new_path='/junkyards/ohio',
            status_code=301)
        CustomRedirect.objects.create(
            old_path='/junkyards/ohio', new_path='/junkyards', status_code=301)
        response = self._call('/junkyards/ohio?ref=seo')
        self.assertEqual(response.status_code, 301)
        self.assertEqual(response['Location'], '/junkyards/ohio')

    def test_bare_path_fallback_when_full_path_misses(self):
        CustomRedirect.objects.create(
            old_path='/vendors/some-yard', new_path='/junkyards/some-yard',
            status_code=301)
        response = self._call('/vendors/some-yard?utm_source=semrush')
        self.assertEqual(response.status_code, 301)
        self.assertEqual(response['Location'], '/junkyards/some-yard')

    def test_302_status_is_honoured(self):
        CustomRedirect.objects.create(old_path='/temporary',
                                      new_path='/junkyards', status_code=302)
        response = self._call('/temporary')
        self.assertEqual(response.status_code, 302)

    def test_no_redirect_row_returns_original_404(self):
        response = self._call('/no-such-legacy-url')
        self.assertEqual(response.status_code, 404)

    def test_non_404_response_is_untouched(self):
        CustomRedirect.objects.create(old_path='/junkyards', new_path='/',
                                      status_code=301)
        ok = HttpResponse(status=200)
        response = self.middleware.process_response(
            self.factory.get('/junkyards'), ok)
        self.assertEqual(response.status_code, 200)

    def test_trailing_slash_variant_is_distinct(self):
        """'/foo' and '/foo/' are different keys; the nginx map covers both."""
        CustomRedirect.objects.create(old_path='/foo/', new_path='/junkyards',
                                      status_code=301)
        self.assertEqual(self._call('/foo/').status_code, 301)
        self.assertEqual(self._call('/foo').status_code, 404)


def record_event(event_type, days_ago=0, hours_ago=0, email=None):
    """Create an analytics row, then back-date it (created_at is auto_now_add)."""
    event = SiteAnalytics.objects.create(
        event_type=event_type,
        user_email=email or f'{event_type}@example.com',
    )
    SiteAnalytics.objects.filter(pk=event.pk).update(
        created_at=timezone.now() - timedelta(days=days_ago, hours=hours_ago + 1))
    return event


class SiteAnalyticsApiTests(TestCase):
    """The summary cards and the drill-down table read the same rows.

    A production screenshot showed "49 logins" next to a detail panel that said
    "0 records / Could not load detail data." These tests pin the shared contract:
    one filter path, one cache key per range, and a list endpoint that paginates.
    """

    SUMMARY_URL = '/api/common/site-analytics/summary/'
    LIST_URL = '/api/common/site-analytics/'

    def setUp(self):
        cache.clear()
        self.admin = User.objects.create_user(
            username='admin-user', email='admin@example.com',
            password='pw-for-tests', is_staff=True)
        self.client = APIClient()
        self.client.force_authenticate(user=self.admin)

        for i in range(3):
            record_event('login', days_ago=1, email=f'fan{i}@example.com')
        record_event('login', days_ago=45)
        record_event('signup', days_ago=2)
        record_event('lead_submit', days_ago=2)

    def _summary(self, query=''):
        response = self.client.get(f'{self.SUMMARY_URL}{query}')
        self.assertEqual(response.status_code, 200)
        return response.json()

    def test_summary_counts_are_all_time_when_no_range_given(self):
        body = self._summary()
        self.assertEqual(body['login'], 4)
        self.assertEqual(body['signup'], 1)
        self.assertEqual(body['lead_submit'], 1)
        self.assertEqual(body['days'], 0)

    def test_summary_groups_only_by_event_type(self):
        """Several events of one type must collapse into a single bucket."""
        self.assertEqual(self._summary()['login'],
                         SiteAnalytics.objects.filter(event_type='login').count())

    def test_summary_window_excludes_older_events(self):
        body = self._summary('?days=30')
        self.assertEqual(body['login'], 3)
        self.assertEqual(body['days'], 30)

    def test_window_edge_is_measured_against_utc_now(self):
        """A row just inside and just outside the 30-day edge land on their own
        side of it, and the card and the table agree on that boundary."""
        inside = record_event('login', days_ago=29, hours_ago=20)
        outside = record_event('login', days_ago=30, hours_ago=4)

        body = self.client.get(f'{self.LIST_URL}?event_type=login&days=30').json()
        ids = {row['id'] for row in body['results']}
        self.assertIn(inside.pk, ids)
        self.assertNotIn(outside.pk, ids)
        self.assertEqual(self._summary('?days=30')['login'], body['count'])

    def test_each_range_gets_its_own_cached_payload(self):
        """One shared cache key would serve the all-time count to a 30-day card."""
        self.assertEqual(self._summary()['login'], 4)
        self.assertEqual(self._summary('?days=30')['login'], 3)
        self.assertEqual(self._summary()['login'], 4)

    def test_unparsable_range_falls_back_to_all_time(self):
        for raw in ('abc', '-5', '0', ''):
            body = self._summary(f'?days={raw}')
            self.assertEqual(body['login'], 4, raw)
            self.assertEqual(body['days'], 0, raw)

    def test_summary_and_detail_agree_on_the_same_window(self):
        summary = self._summary('?days=30')
        page = self.client.get(
            f'{self.LIST_URL}?event_type=login&days=30')
        self.assertEqual(page.status_code, 200)
        body = page.json()
        self.assertEqual(summary['login'], body['count'])
        self.assertEqual(len(body['results']), body['count'])

    def test_detail_rows_carry_the_fields_the_table_renders(self):
        body = self.client.get(f'{self.LIST_URL}?event_type=login').json()
        row = body['results'][0]
        for field in ('id', 'event_type', 'user_type', 'user_email',
                      'ip_address', 'metadata', 'created_at'):
            self.assertIn(field, row)

    def test_detail_pagination_honours_page_size_and_caps_abuse(self):
        for i in range(30):
            record_event('lead_submit', email=f'sub{i}@example.com')
        total = SiteAnalytics.objects.filter(event_type='lead_submit').count()

        small = self.client.get(f'{self.LIST_URL}?event_type=lead_submit&page_size=5').json()
        self.assertEqual(len(small['results']), 5)
        self.assertEqual(small['count'], total)

        second = self.client.get(
            f'{self.LIST_URL}?event_type=lead_submit&page_size=5&page=2').json()
        self.assertNotEqual([r['id'] for r in second['results']],
                            [r['id'] for r in small['results']])

        greedy = self.client.get(f'{self.LIST_URL}?event_type=lead_submit&page_size=9999')
        self.assertEqual(greedy.status_code, 200)
        self.assertLessEqual(len(greedy.json()['results']), 100)

    def test_empty_range_returns_zero_without_an_error(self):
        """Genuinely no rows must read as 0 records, not as a failed request."""
        SiteAnalytics.objects.all().delete()
        cache.clear()
        self.assertEqual(self._summary('?days=30')['login'], 0)
        body = self.client.get(f'{self.LIST_URL}?event_type=login&days=30').json()
        self.assertEqual(body['count'], 0)
        self.assertEqual(body['results'], [])

    def test_anonymous_and_non_staff_cannot_read_analytics(self):
        anon = APIClient()
        for url in (self.SUMMARY_URL, self.LIST_URL):
            self.assertIn(anon.get(url).status_code, (401, 403))

        member = User.objects.create_user(username='vendor-user',
                                          email='vendor@example.com',
                                          password='pw-for-tests')
        outsider = APIClient()
        outsider.force_authenticate(user=member)
        self.assertEqual(outsider.get(self.LIST_URL).status_code, 403)

    def test_duplicated_detail_route_is_no_longer_routable(self):
        """Analytics.jsx now reads the list route, which exists in production;
        the second implementation stayed deleted instead of drifting again."""
        response = self.client.get('/api/common/analytics/detail/?event_type=login')
        self.assertEqual(response.status_code, 404)
