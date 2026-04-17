#!/bin/bash
python manage.py migrate --noinput
python manage.py collectstatic --noinput
python manage.py seed_cms
gunicorn core.wsgi:application --bind 0.0.0.0:8000 --workers 3 --timeout 600 --keep-alive 5 --log-level info --access-logfile '-' --error-logfile '-'
