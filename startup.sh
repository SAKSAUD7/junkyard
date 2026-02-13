#!/bin/bash
# Azure App Service startup script for Django application

# Navigate to backend directory
cd /tmp/8de6a191c3f5482/backend

# Run database migrations
python manage.py migrate --noinput

# Collect static files
python manage.py collectstatic --noinput

# Start Gunicorn
# Start Gunicorn
gunicorn --bind=0.0.0.0:8000 --timeout 600 --workers 4 core.wsgi:application

