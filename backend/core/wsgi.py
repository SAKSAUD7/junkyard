"""
WSGI config for core project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")

# Auto-apply database migrations on startup (Important for Azure deployment)
from django.core.management import call_command
try:
    import logging
    logger = logging.getLogger(__name__)
    logger.info("Running automatic database migrations...")
    call_command('migrate', '--noinput')
    logger.info("Database migrations completed successfully.")
except Exception as e:
    print(f"Error running automatic migrations: {e}")

application = get_wsgi_application()
