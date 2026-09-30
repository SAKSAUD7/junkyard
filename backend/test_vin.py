import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.test import Client
c = Client(SERVER_NAME='localhost')
response = c.post('/api/vin/decode/', {'vin': '1FMCU0EZ1MUB10xxx'}, content_type='application/json')
print('Status Code:', response.status_code)
print('Response:', response.json())
