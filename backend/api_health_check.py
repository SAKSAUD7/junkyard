import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.conf import settings
from django.urls import get_resolver
from django.test import Client

def get_api_urls(url_patterns, prefix=''):
    api_routes = []
    for pattern in url_patterns:
        if hasattr(pattern, 'url_patterns'):
            api_routes.extend(get_api_urls(pattern.url_patterns, prefix + str(pattern.pattern)))
        else:
            route = prefix + str(pattern.pattern)
            # filter for just REST API endpoints
            if route.startswith('api/') or route.startswith('/api/'):
                route = '/' + route.lstrip('/')
                route = route.replace('^', '').replace('$', '').replace('\\Z', '')
                api_routes.append(route)
    return api_routes

resolver = get_resolver()
all_api_urls = get_api_urls(resolver.url_patterns)

client = Client(SERVER_NAME='localhost')
errors = []

print(f"Discovered {len(all_api_urls)} API routes. Starting health check...")

for route in all_api_urls:
    if '<' in route or '(?P' in route:
        continue
    try:
        response = client.get(route)
        if response.status_code >= 500:
            errors.append(f"FAIL [500]: {route} -> {response.status_code} ({response.content[:100]})")
        else:
            print(f"PASS: {route} -> {response.status_code}")
    except Exception as e:
        errors.append(f"ERROR: {route} -> {str(e)}")

print("\n--- RESULTS ---")
if not errors:
    print("SUCCESS: 0 endpoints returned 500!")
else:
    for err in errors:
        print(err)
