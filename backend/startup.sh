#!/bin/bash
python manage.py collectstatic --noinput
python manage.py migrate --noinput
# Import COMPLETE database dump (Run manually via SSH to avoid startup timeout)
# python manage.py import_full_database
# Import initial data (safe to run multiple times, continue even if it fails)
python manage.py import_data || echo "Data import failed or already complete"
# Create superuser if it doesn't exist (continue even if it fails)
python create_superuser.py || echo "Superuser creation failed or already exists"
gunicorn core.wsgi:application --bind=0.0.0.0:8000 --timeout 600
