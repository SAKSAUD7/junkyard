"""
Vendor CSV Import Views
Handles bulk vendor import with validation and error reporting
"""
import csv
import io
import re
import uuid
from datetime import datetime
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.http import HttpResponse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication

from apps.hollander.models import Vendor

User = get_user_model()


def validate_zip_code(zip_code):
    """
    Validate ZIP/PIN code for global formats.
    
    Accepts:
    - 5 digits: 12345
    - 6 digits: 123456
    - 9 digits: 123456789
    - Alphanumeric with optional spaces/hyphens: T2C 4E6, R2C2Z2, SW1A 1AA
    
    Rejects:
    - Empty values
    - Symbol-only inputs
    
    Returns:
        tuple: (is_valid: bool, error_message: str or None)
    """
    if not zip_code or not str(zip_code).strip():
        return False, "ZIP/PIN code is required"
    
    zip_code = str(zip_code).strip()
    
    # Check for symbols-only (invalid)
    if not any(c.isalnum() for c in zip_code):
        return False, "ZIP/PIN code contains only symbols"
    
    # Valid patterns
    patterns = [
        r'^\d{5}$',  # 5 digits (US)
        r'^\d{6}$',  # 6 digits (India, etc.)
        r'^\d{9}$',  # 9 digits (US extended)
        r'^[A-Z0-9]{3}\s?[A-Z0-9]{3}$',  # Canadian: T2C 4E6, R2C2Z2
        r'^[A-Z]{1,2}\d{1,2}\s?\d[A-Z]{2}$',  # UK: SW1A 1AA, W1A 1AA
        r'^[A-Z0-9\s-]{3,10}$'  # Generic alphanumeric with spaces/hyphens
    ]
    
    for pattern in patterns:
        if re.match(pattern, zip_code, re.IGNORECASE):
            return True, None
    
    return False, "Invalid ZIP/PIN code format"


def validate_vendor_row(row_data, row_num, headers):
    """
    Validate a single vendor row.
    
    Args:
        row_data: dict with column headers as keys
        row_num: int row number for error reporting
        headers: list of original column headers
    
    Returns:
        tuple: (is_valid: bool, errors: list of error messages)
    """
    errors = []
    
    # Required fields validation with flexible field name matching
    required_fields = {
        'name': ['name', 'vendor_name'],  # Support both 'name' and 'Vendor Name'
        'city': ['city'],
        'state': ['state'],
        'zip_code': ['zip_code', 'zipcode', 'zip', 'postal_code']
    }
    
    field_labels = {
        'name': 'Vendor Name',
        'city': 'City',
        'state': 'State',
        'zip_code': 'ZIP Code'
    }
    
    # Normalize headers (case-insensitive matching)
    normalized_row = {k.lower().strip().replace(' ', '_'): v for k, v in row_data.items()}
    
    # Check required fields with flexible matching
    for field_key, possible_names in required_fields.items():
        value = ''
        # Try all possible field name variations
        for possible_name in possible_names:
            if possible_name in normalized_row:
                value = normalized_row.get(possible_name, '').strip() if normalized_row.get(possible_name) else ''
                if value:
                    break
        
        if not value:
            errors.append(f"{field_labels[field_key]} is required")
    
    # Validate ZIP code if present
    zip_value = ''
    for zip_field in ['zip_code', 'zipcode', 'zip', 'postal_code']:
        if zip_field in normalized_row:
            zip_value = normalized_row.get(zip_field, '').strip() if normalized_row.get(zip_field) else ''
            if zip_value:
                break
    
    if zip_value:
        is_valid, error_msg = validate_zip_code(zip_value)
        if not is_valid:
            errors.append(error_msg)
    
    # Validate email if present
    email_value = normalized_row.get('email', '').strip() if normalized_row.get('email') else ''
    if email_value:
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, email_value):
            errors.append("Invalid email format")
    
    return len(errors) == 0, errors


def generate_error_csv(original_headers, error_rows_data):
    """
    Generate error CSV preserving original structure.
    
    Args:
        original_headers: List of column names from uploaded file
        error_rows_data: List of dicts with 'row_data' and 'errors'
    
    Returns:
        str: CSV content
    """
    output = io.StringIO()
    
    # Add "Errors" column to headers
    headers_with_errors = original_headers + ['Errors']
    
    writer = csv.DictWriter(output, fieldnames=headers_with_errors)
    writer.writeheader()
    
    for error_row in error_rows_data:
        row_dict = error_row['row_data'].copy()  # Original row data as dict
        row_dict['Errors'] = '; '.join(error_row['errors'])  # Add errors
        writer.writerow(row_dict)
    
    return output.getvalue()


@api_view(['POST'])
@permission_classes([IsAdminUser])
def upload_vendor_csv(request):
    """
    Upload and validate vendor CSV file.
    
    Returns preview with validation results and stores session data in cache.
    """
    if 'file' not in request.FILES:
        return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    uploaded_file = request.FILES['file']
    
    # Validate file extension
    if not uploaded_file.name.endswith(('.csv', '.CSV')):
        return Response({'error': 'Only CSV files are supported'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Read and parse CSV
        file_content = uploaded_file.read().decode('utf-8-sig')  # Handle BOM
        csv_reader = csv.DictReader(io.StringIO(file_content))
        
        # Store original headers (preserve exact names and order)
        original_headers = csv_reader.fieldnames
        if not original_headers:
            return Response({'error': 'CSV file has no headers'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Process rows
        valid_rows = []
        error_rows = []
        row_num = 0  # Start from 0, will increment to 1 for first data row
        
        for row in csv_reader:
            row_num += 1  # First data row will be 1
            is_valid, errors = validate_vendor_row(row, row_num, original_headers)
            
            if is_valid:
                valid_rows.append(row)
            else:
                error_rows.append({
                    'row': row_num,
                    'row_data': row,
                    'errors': errors
                })
        
        # Generate upload session ID
        upload_id = str(uuid.uuid4())
        
        # Store session data in cache (expires in 1 hour)
        session_data = {
            'upload_id': upload_id,
            'filename': uploaded_file.name,
            'original_headers': original_headers,
            'valid_rows': valid_rows,
            'error_rows': error_rows,
            'user_id': request.user.id,
            'uploaded_at': datetime.now().isoformat()
        }
        
        cache.set(f'vendor_import_{upload_id}', session_data, timeout=3600)
        
        # Prepare response
        response_data = {
            'valid': True,
            'upload_id': upload_id,
            'total_rows': row_num,  # row_num already represents data rows only
            'valid_rows': len(valid_rows),
            'invalid_rows': len(error_rows),
            'error_details': [
                {'row': err['row'], 'errors': err['errors']}
                for err in error_rows[:100]  # Limit to first 100 for preview
            ]
        }
        
        return Response(response_data, status=status.HTTP_200_OK)
        
    except UnicodeDecodeError:
        return Response({'error': 'File encoding error. Please ensure the file is UTF-8 encoded'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': f'Failed to process CSV: {str(e)}'}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def confirm_vendor_import(request):
    """
    Confirm and execute vendor import for valid rows.
    """
    upload_id = request.data.get('upload_id')
    
    if not upload_id:
        return Response({'error': 'upload_id is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Retrieve session data from cache
    session_data = cache.get(f'vendor_import_{upload_id}')
    
    if not session_data:
        return Response({'error': 'Import session expired or not found'}, 
                       status=status.HTTP_404_NOT_FOUND)
    
    try:
        valid_rows = session_data['valid_rows']
        created_count = 0
        updated_count = 0
        
        for row in valid_rows:
            # Normalize field names
            normalized_row = {k.lower().strip().replace(' ', '_'): v.strip() if v else '' 
                            for k, v in row.items()}
            
            # Extract vendor data
            vendor_data = {
                'name': normalized_row.get('name', normalized_row.get('vendor_name', '')),
                'address': normalized_row.get('address', ''),
                'city': normalized_row.get('city', ''),
                'state': normalized_row.get('state', ''),
                'zip_code': normalized_row.get('zip_code', normalized_row.get('zipcode', '')),
                'phone': normalized_row.get('phone', ''),
                'email': normalized_row.get('email', ''),
                'website': normalized_row.get('website', ''),
            }
            
            # Try to find existing vendor by name and city
            existing_vendor = Vendor.objects.filter(
                name__iexact=vendor_data['name'],
                city__iexact=vendor_data['city']
            ).first()
            
            if existing_vendor:
                # Update existing vendor
                for key, value in vendor_data.items():
                    if value:  # Only update non-empty values
                        setattr(existing_vendor, key, value)
                existing_vendor.save()
                updated_count += 1
            else:
                # Create new vendor (need to generate yard_id)
                max_yard_id = Vendor.objects.all().order_by('-yard_id').first()
                next_yard_id = (max_yard_id.yard_id + 1) if max_yard_id else 1
                
                vendor_data['yard_id'] = next_yard_id
                Vendor.objects.create(**vendor_data)
                created_count += 1
        
        # Clear cache
        cache.delete(f'vendor_import_{upload_id}')
        
        return Response({
            'message': 'Import completed successfully',
            'stats': {
                'created': created_count,
                'updated': updated_count,
                'total': created_count + updated_count
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({'error': f'Import failed: {str(e)}'}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def download_error_report(request, upload_id):
    """
    Download error report CSV with original structure and inline errors.
    """
    # Retrieve session data from cache
    session_data = cache.get(f'vendor_import_{upload_id}')
    
    if not session_data:
        return Response({'error': 'Import session expired or not found'}, 
                       status=status.HTTP_404_NOT_FOUND)
    
    original_headers = session_data['original_headers']
    error_rows = session_data['error_rows']
    
    if not error_rows:
        return Response({'error': 'No errors to report'}, status=status.HTTP_404_NOT_FOUND)
    
    # Generate error CSV
    csv_content = generate_error_csv(original_headers, error_rows)
    
    # Create HTTP response
    response = HttpResponse(csv_content, content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename="vendor_import_errors_{upload_id[:8]}.csv"'
    
    return response
