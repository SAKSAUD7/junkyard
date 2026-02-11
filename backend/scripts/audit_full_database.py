import os
import django
import sys
from django.conf import settings

# Setup Django Environment
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir) # points to backend/
project_root = os.path.dirname(backend_dir) # points to junkyard/ (git root)
sys.path.append(backend_dir)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.apps import apps

# List of apps/models to check based on user request
MODELS_TO_CHECK = [
    # Ads
    ('ads', 'Advertisement'),
    
    # Auth
    ('auth', 'Group'),
    ('users', 'User'),
    # ('users', 'LegacyUser'), # Removed: Not in models.py
    # ('users', 'LegacyAccount'), # Removed: Not in models.py
    
    # Common
    ('common', 'City'),
    ('common', 'Make'),
    ('common', 'Model'),
    ('common', 'Part'),
    ('common', 'State'),
    
    # Hollander
    ('hollander', 'Association'),
    ('hollander', 'Country'),
    ('hollander', 'HollanderIndex'),
    ('hollander', 'HollanderInterchange'),
    ('hollander', 'HollanderMakeModelRef'),
    ('hollander', 'HollanderPartRef'),
    ('hollander', 'Make'),
    ('hollander', 'Model'),
    ('hollander', 'PartPricing'),
    ('hollander', 'PartSpecification'),
    ('hollander', 'PartType'),
    ('hollander', 'PresetLocation'),
    ('hollander', 'PresetMake'),
    ('hollander', 'PresetModel'),
    ('hollander', 'PresetPart'),
    ('hollander', 'PresetVehicle'),
    ('hollander', 'ProfileVisit'),
    ('hollander', 'State'),
    ('hollander', 'VehicleImage'),
    ('hollander', 'VendorDetail'),
    ('hollander', 'VendorHours'),
    ('hollander', 'VendorImportBatch'),
    ('hollander', 'VendorImportRecord'),
    ('hollander', 'VendorRating'),
    ('hollander', 'Vendor'),  # Vendors
    ('hollander', 'YearRange'),
    ('hollander', 'Zipcode'),
    
    # Leads
    ('leads', 'Lead'),
    ('leads', 'VendorLead'),
    
    # Tokens
    ('token_blacklist', 'BlacklistedToken'),
    ('token_blacklist', 'OutstandingToken'),
    
    # Vendor Profiles
    ('users', 'VendorProfile'), # Fixed: Moved from vendor_profiles app to users app
    
    # Vendor Portal
    ('vendor_portal', 'VendorBusinessHours'),
    ('vendor_portal', 'VendorInventory'),
    ('vendor_portal', 'VendorNotification'),
    
    # Yard Submissions
    ('yard_submissions', 'YardSubmission'),
]

# Write results to file
output_file = os.path.join(backend_dir, 'audit_results.txt')

with open(output_file, 'w', encoding='utf-8') as f:
    f.write(f"{'APP':<20} {'MODEL':<30} {'COUNT':<10} {'STATUS'}\n")
    f.write("-" * 70 + "\n")

    for app_label, model_name in MODELS_TO_CHECK:
        try:
            model = apps.get_model(app_label, model_name)
            count = model.objects.count()
            status = "✅ OK" if count > 0 else "⚠️ EMPTY"
            f.write(f"{app_label:<20} {model_name:<30} {count:<10} {status}\n")
        except LookupError:
            f.write(f"{app_label:<20} {model_name:<30} {'N/A':<10} ❌ MODEL NOT FOUND\n")
        except Exception as e:
            f.write(f"{app_label:<20} {model_name:<30} {'ERR':<10} ❌ {str(e)}\n")

print(f"Audit complete. Results written to {output_file}")
