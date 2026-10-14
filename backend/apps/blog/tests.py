from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from apps.blog.models import Author, BlogPost

PASSWORD = "Str0ng-test-pass-99"


class PublicBlogAuthorFilterTests(TestCase):
    """?author= is user input on an AllowAny list route.

    It was passed straight to filter(author__id=...), so ?author=abc raised
    ValueError and turned the public blog listing into a 500.
    """

    def setUp(self):
        self.client = APIClient()
        self.author_a = Author.objects.create(name="Author A")
        self.author_b = Author.objects.create(name="Author B")
        for index, author in ((1, self.author_a), (2, self.author_b)):
            BlogPost.objects.create(
                title=f"Post {index}",
                author=author,
                status="published",
                published_at=timezone.now() - timezone.timedelta(hours=1),
            )

    def posts(self, query_string):
        response = self.client.get(f"/api/blog/posts/?{query_string}")
        self.assertEqual(response.status_code, 200, response.data)
        return {row["title"] for row in response.json()["results"]}

    def test_non_numeric_author_is_ignored_instead_of_crashing(self):
        self.assertEqual(len(self.posts("author=abc")), 2)

    def test_empty_author_is_ignored(self):
        self.assertEqual(len(self.posts("author=")), 2)

    def test_numeric_author_still_filters(self):
        titles = self.posts(f"author={self.author_a.id}")
        self.assertEqual(titles, {"Post 1"})

    def test_unknown_numeric_author_returns_no_rows(self):
        self.assertEqual(self.posts("author=999999"), set())
