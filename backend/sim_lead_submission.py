import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.test import Client
from apps.leads.models import VehicleSubmission
from apps.common.models import AdminNotification

def test_submission():
    client = Client()
    
    print("Initial Leads Count:", VehicleSubmission.objects.count())
    print("Initial Notifications Count:", AdminNotification.objects.count())

    payload = {
        "year": "2015",
        "make": "Toyota",
        "model": "Camry",
        "trim": "LE",
        "vin": "4T1BF1FK3EU112345",
        "mileage": "150000",
        "part": "Whole Vehicle",
        "drivable": True,
        "starts": True,
        "has_title": True,
        "transportation_required": True,
        "name": "Test User",
        "phone": "555-555-5555",
        "email": "test@example.com",
        "zip_code": "90210",
        "city": "Beverly Hills",
        "state": "CA",
        "description": "Just testing the flow"
    }

    response = client.post('/api/sell-your-car/', data=payload, content_type='application/json', HTTP_HOST='127.0.0.1')
    
    print("Response Status Code:", response.status_code)
    try:
        print("Response JSON:", response.json())
    except:
        pass
        
    print("Post-Post Leads Count:", VehicleSubmission.objects.count())
    print("Post-Post Notifications Count:", AdminNotification.objects.count())
    
    # Check the newest notification
    latest = AdminNotification.objects.order_by('-created_at').first()
    if latest:
        print("Latest Notification Title:", latest.title)
        print("Latest Notification Message:", latest.message)
    else:
        print("FAIL: No notification was created")

if __name__ == '__main__':
    test_submission()
