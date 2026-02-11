# Minimal Core Application Changes

## Required Changes to `backend/core/settings.py`

Add PostgreSQL support and Azure Blob Storage (cloud-agnostic):

```python
# Add after existing imports
import os
from pathlib import Path

# Database - Cloud-agnostic configuration
DATABASES = {
    'default': {
        'ENGINE': os.environ.get('DB_ENGINE', 'django.db.backends.sqlite3'),
        'NAME': os.environ.get('DB_NAME', BASE_DIR / 'db.sqlite3'),
        'USER': os.environ.get('DB_USER', ''),
        'PASSWORD': os.environ.get('DB_PASSWORD', ''),
        'HOST': os.environ.get('DB_HOST', ''),
        'PORT': os.environ.get('DB_PORT', ''),
        'OPTIONS': {
            'driver': 'ODBC Driver 18 for SQL Server',
            'extra_params': os.environ.get('DB_OPTIONS', ''),
        } if os.environ.get('DB_ENGINE') == 'mssql' else {}
    }
}

# Static files - Cloud-agnostic
STATIC_ROOT = os.environ.get('STATIC_ROOT', BASE_DIR / 'staticfiles')
STATIC_URL = os.environ.get('STATIC_URL', '/static/')

# Media files - Cloud-agnostic
if os.environ.get('AZURE_STORAGE_ACCOUNT_NAME'):
    # Azure Blob Storage (via django-storages)
    DEFAULT_FILE_STORAGE = 'storages.backends.azure_storage.AzureStorage'
    AZURE_ACCOUNT_NAME = os.environ.get('AZURE_STORAGE_ACCOUNT_NAME')
    AZURE_ACCOUNT_KEY = os.environ.get('AZURE_STORAGE_ACCOUNT_KEY')
    AZURE_CONTAINER = os.environ.get('AZURE_STORAGE_CONTAINER', 'media')
    AZURE_CUSTOM_DOMAIN = f'{AZURE_ACCOUNT_NAME}.blob.core.windows.net'
    MEDIA_URL = f'https://{AZURE_CUSTOM_DOMAIN}/{AZURE_CONTAINER}/'
else:
    # Local file storage
    MEDIA_URL = '/media/'
    MEDIA_ROOT = BASE_DIR / 'media'
```

## Add to `backend/requirements.txt`

```
mssql-django
pyodbc
gunicorn
django-storages[azure]
```

## No Changes Required To:

- ❌ `/backend/apps/` (all app code)
- ❌ `/backend/core/urls.py`
- ❌ `/backend/core/wsgi.py`
- ❌ `/frontend/` (entire frontend)
- ❌ Any business logic
- ❌ Any models, views, serializers

## Why This Works

1. **Environment-driven**: All cloud-specific config via env vars
2. **Conditional logic**: Azure storage only if env var present
3. **Fallback to local**: Works locally without Azure
4. **No Azure SDK**: Uses generic `django-storages` library

## Testing Locally

```bash
# Local development (no Azure)
export DB_ENGINE=django.db.backends.sqlite3
python manage.py runserver

# Test with PostgreSQL (no Azure)
export DB_ENGINE=django.db.backends.postgresql
export DB_HOST=localhost
export DB_NAME=junkyard_db
python manage.py runserver

# Test with Azure (optional)
export AZURE_STORAGE_ACCOUNT_NAME=junkyardstorage
export AZURE_STORAGE_ACCOUNT_KEY=abc123...
python manage.py runserver
```

All three scenarios work with the SAME code!
