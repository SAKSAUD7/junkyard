#!/bin/bash
python manage.py migrate --noinput
python manage.py collectstatic --noinput
gunicorn core.wsgi:application --bind 0.0.0.0:8000 --workers 2 --timeout 120 --keep-alive 5 --log-level info --access-logfile '-' --error-logfile '-'
