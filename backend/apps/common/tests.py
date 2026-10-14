from django.http import HttpResponse, HttpResponseNotFound
from django.test import RequestFactory, TestCase

from apps.common.middleware import CustomRedirectMiddleware
from apps.common.models import CustomRedirect


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
