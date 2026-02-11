import os
import django
import sys
import re

# Setup Django environment
sys.path.append('/home/adminpc/junkyard/junkyard/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.vendors.import_views import validate_zip_code, validate_vendor_row

def run_tests():
    print("Running Import Logic Verification...\n")

    # 1. ZIP Code Validation Tests
    print("1. Testing ZIP Code Validation:")
    zips = [
        ('12345', True),
        ('123456', True),  # 6-digit (e.g. India)
        ('123456789', True),
        ('M5V 2H1', True), # Canada
        ('SW1A 1AA', True), # UK
        ('INVALID-ZIP', False), # Too long/wrong chars
        ('123', False), # Too short
        ('!!!', False),
        ('', False)
    ]
    
    for zip_code, expected in zips:
        is_valid, msg = validate_zip_code(zip_code)
        result = "PASS" if is_valid == expected else "FAIL"
        print(f"   [{result}] '{zip_code}': Expected {expected}, Got {is_valid} ({msg})")

    # 2. Row Validation Tests
    print("\n2. Testing Row Validation:")
    
    headers = ['name', 'city', 'state', 'zip_code']
    
    # Valid Row
    valid_row = {'name': 'Test Vendor', 'city': 'Test City', 'state': 'TS', 'zip_code': '12345'}
    is_valid, errors = validate_vendor_row(valid_row, 1, headers)
    print(f"   [{'PASS' if is_valid else 'FAIL'}] Valid Row: {is_valid} (Errors: {errors})")
    
    # Invalid Row (Missing Name)
    invalid_row_1 = {'name': '', 'city': 'Test City', 'state': 'TS', 'zip_code': '12345'}
    is_valid, errors = validate_vendor_row(invalid_row_1, 2, headers)
    print(f"   [{'PASS' if not is_valid else 'FAIL'}] Missing Name: {is_valid} (Errors: {errors})")
    
    # Invalid Row (Bad ZIP)
    invalid_row_2 = {'name': 'Test Vendor', 'city': 'Test City', 'state': 'TS', 'zip_code': 'BAD-ZIP-CODE'}
    is_valid, errors = validate_vendor_row(invalid_row_2, 3, headers)
    print(f"   [{'PASS' if not is_valid else 'FAIL'}] Bad ZIP: {is_valid} (Errors: {errors})")

    print("\nVerification Complete.")

if __name__ == '__main__':
    run_tests()
