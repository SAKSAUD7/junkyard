"""Settings for the local automated test suite.

Forces both database aliases onto in-memory SQLite (the production `vpic_db`
alias is Postgres-only and psycopg is not installed on every workstation), pins
a throwaway secret key, and keeps mail in memory so no test can reach SMTP.
Never referenced by settings.py, wsgi.py or deployment scripts.
"""

import os

os.environ.setdefault("SECRET_KEY", "django-tests-only-key-not-a-secret")

from .settings import *  # noqa: E402,F403

DEBUG = False
SECRET_KEY = "django-tests-only-key-not-a-secret"

DATABASES = {
    "default": {"ENGINE": "django.db.backends.sqlite3", "NAME": ":memory:"},
    "vpic_db": {"ENGINE": "django.db.backends.sqlite3", "NAME": ":memory:"},
}

EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
DEFAULT_FROM_EMAIL = "noreply@test.local"
LEAD_NOTIFICATION_EMAIL = "leads@test.local"

CACHES = {"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"}}

PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]
