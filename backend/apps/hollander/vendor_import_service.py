"""
Vendor Import Service
======================
Handles CSV/XLSX file parsing, validation, and bulk vendor import operations.
"""
import csv
import re
from io import StringIO
from decimal import Decimal
from typing import Dict, List, Tuple, Any
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.utils import timezone

try:
    import openpyxl
    XLSX_SUPPORT = True
except ImportError:
    XLSX_SUPPORT = False

from .models import Vendor
from .models import Vendor, VendorImportBatch, VendorImportRecord


# Schema Definition
REQUIRED_COLUMNS = [
    'Vendor Name', 'Email', 'Phone', 'Address',
    'City', 'State', 'Zip Code', 'Status',
    'Featured', 'Top Rated'
]

COLUMN_MAPPING = {
    'Vendor Name': 'name',
    'Email': 'email',
    'Phone': 'phone',
    'Address': 'address',
    'City': 'city',
    'State': 'state',
    'Zip Code': 'zip_code',
    'Status': 'is_active',
    'Featured': 'is_featured',
    'Top Rated': 'is_top_rated',
    'Description': 'description',
    'Rating': 'rating_stars',
    'Website': 'website',
    'Yard ID': 'yard_id',
}


class VendorImportService:
    """Service for handling bulk vendor imports"""
    
    def __init__(self):
        self.errors = []
        self.valid_rows = []
        self.invalid_rows = []
    
    def validate_file_type(self, filename: str) -> bool:
        """Validate file extension is CSV or XLSX"""
        valid_extensions = ['.csv', '.xlsx']
        return any(filename.lower().endswith(ext) for ext in valid_extensions) 
    
    def parse_file(self, file_obj, filename: str) -> Tuple[List[Dict], List[str]]:
        """
        Parse CSV or XLSX file and return rows as list of dictionaries
        Returns: (rows, column_headers)
        """
        if filename.lower().endswith('.csv'):
            return self._parse_csv(file_obj)
        elif filename.lower().endswith('.xlsx'):
            if not XLSX_SUPPORT:
                raise ValueError("XLSX support not available. Install openpyxl.")
            return self._parse_xlsx(file_obj)
        else:
            raise ValueError(f"Unsupported file type: {filename}")
    
    def _parse_csv(self, file_obj) -> Tuple[List[Dict], List[str]]:
        """Parse CSV file"""
        # Read file content
        content = file_obj.read()
        if isinstance(content, bytes):
            content = content.decode('utf-8-sig')  # Handle BOM
        
        # Parse CSV
        csv_file = StringIO(content)
        reader = csv.DictReader(csv_file)
        rows = list(reader)
        headers = reader.fieldnames if reader.fieldnames else []
        
        return rows, headers
    
    def _parse_xlsx(self, file_obj) -> Tuple[List[Dict], List[str]]:
        """Parse XLSX file"""
        workbook = openpyxl.load_workbook(file_obj, data_only=True)
        sheet = workbook.active
        
        # Get headers from first row
        headers = []
        for cell in sheet[1]:
            headers.append(str(cell.value) if cell.value else '')
        
        # Get data rows
        rows = []
        for row_idx, row in enumerate(sheet.iter_rows(min_row=2, values_only=True), start=2):
            row_dict = {}
            for header, value in zip(headers, row):
                row_dict[header] = str(value) if value is not None else ''
            rows.append(row_dict)
        
        return rows, headers
    
    def validate_schema(self, headers: List[str]) -> List[str]:
        """Validate that all required columns are present"""
        errors = []
        missing_columns = []
        
        # Normalize headers for comparison (case-insensitive, strip whitespace)
        normalized_headers = {h.strip().lower(): h for h in headers}
        
        for required_col in REQUIRED_COLUMNS:
            if required_col.lower() not in normalized_headers:
                missing_columns.append(required_col)
        
        if missing_columns:
            errors.append(f"Missing required columns: {', '.join(missing_columns)}")
        
        return errors
    
    def validate_email_format(self, email: str) -> bool:
        """Validate email format"""
        if not email or not email.strip():
            return False
        try:
            validate_email(email)
            return True
        except ValidationError:
            return False
    
    def validate_phone_format(self, phone: str) -> Tuple[bool, str]:
        """
        Validate and normalize phone format
        Returns: (is_valid, normalized_phone)
        """
        if not phone:
            return False, ''
        
        # Strip all non-digit characters
        digits = re.sub(r'\D', '', phone)
        
        # Valid if 10 or 11 digits (with country code)
        if len(digits) == 10:
            return True, f"({digits[:3]}) {digits[3:6]}-{digits[6:]}"
        elif len(digits) == 11 and digits[0] == '1':
            return True, f"+1 ({digits[1:4]}) {digits[4:7]}-{digits[7:]}"
        else:
            return False, phone
    
    def validate_zip_code(self, zip_code: str) -> bool:
        """Validate ZIP code (5 or 9 digit format)"""
        if not zip_code:
            return False
        # Remove spaces and hyphens
        clean_zip = re.sub(r'[\s-]', '', zip_code)
        # Valid: 5 digits or 9 digits
        return bool(re.match(r'^\d{5}(\d{4})?$', clean_zip))
    
    def validate_state(self, state: str) -> Tuple[bool, str]:
        """Validate state code (2-letter uppercase)"""
        if not state or len(state.strip()) != 2:
            return False, state
        normalized = state.strip().upper()
        # Simple US state code validation
        return True, normalized
    
    def parse_boolean(self, value: str) -> bool:
        """Parse boolean from string"""
        if not value:
            return False
        value_lower = str(value).strip().lower()
        return value_lower in ['yes', 'true', '1', 'y', 't']
    
    def validate_row(self, row: Dict, row_number: int) -> Tuple[bool, List[str], Dict]:
        """
        Validate a single row and return validation results
        Returns: (is_valid, errors, normalized_data)
        """
        errors = []
        normalized_data = {}
        
        # Required field: Vendor Name
        if not row.get('Vendor Name', '').strip():
            errors.append("Vendor Name is required")
        else:
            normalized_data['name'] = row['Vendor Name'].strip()
        
        # Required field: Email
        email = row.get('Email', '').strip()
        if not self.validate_email_format(email):
            errors.append(f"Invalid email format: '{email}'")
        else:
            normalized_data['email'] = email.lower()
        
        # Phone validation
        phone = row.get('Phone', '').strip()
        is_valid_phone, normalized_phone = self.validate_phone_format(phone)
        if not is_valid_phone:
            errors.append(f"Invalid phone format: '{phone}' (expected 10 digits)")
        else:
            normalized_data['phone'] = normalized_phone
        
        # Zip Code validation
        zip_code = row.get('Zip Code', '').strip()
        if not self.validate_zip_code(zip_code):
            errors.append(f"Invalid ZIP code: '{zip_code}' (expected 5 or 9 digits)")
        else:
            normalized_data['zip_code'] = zip_code
        
        # State validation
        state = row.get('State', '').strip()
        is_valid_state, normalized_state = self.validate_state(state)
        if not is_valid_state:
            errors.append(f"Invalid state code: '{state}' (expected 2-letter code)")
        else:
            normalized_data['state'] = normalized_state
        
        # City (required)
        city = row.get('City', '').strip()
        if not city:
            errors.append("City is required")
        else:
            normalized_data['city'] = city
        
        # Address
        normalized_data['address'] = row.get('Address', '').strip()
        
        # Description (Optional)
        normalized_data['description'] = row.get('Description', '').strip()
        
        # Status (Active/Inactive)
        status = row.get('Status', '').strip().lower()
        if status not in ['active', 'inactive']:
            errors.append(f"Invalid status: '{status}' (expected 'Active' or 'Inactive')")
        else:
            normalized_data['is_active'] = (status == 'active')
        
        # Boolean fields
        normalized_data['is_featured'] = self.parse_boolean(row.get('Featured', ''))
        normalized_data['is_top_rated'] = self.parse_boolean(row.get('Top Rated', ''))
        
        # Rating (Optional 1-5 stars)
        rating_str = row.get('Rating', '').strip()
        if rating_str:
            try:
                rating = int(rating_str)
                if rating < 1 or rating > 5:
                    errors.append(f"Invalid rating: '{rating}' (expected 1-5)")
                else:
                    normalized_data['rating_stars'] = rating
                    normalized_data['rating_percentage'] = int((rating / 5) * 100)
            except ValueError:
                errors.append(f"Invalid rating format: '{rating_str}' (expected number 1-5)")
        else:
             # Default rating if not provided
             normalized_data['rating_stars'] = 5
             normalized_data['rating_percentage'] = 100
        
        # Optional fields
        normalized_data['website'] = row.get('Website', '').strip()
        
        # Yard ID (optional legacy ID)
        yard_id_str = row.get('Yard ID', '').strip()
        if yard_id_str:
            try:
                normalized_data['yard_id'] = int(yard_id_str)
            except ValueError:
                errors.append(f"Invalid Yard ID: '{yard_id_str}' (expected integer)")
        
        is_valid = len(errors) == 0
        return is_valid, errors, normalized_data
    
    def process_preview(self, file_obj, filename: str) -> Dict[str, Any]:
        """
        Process file and generate preview data
        Returns preview with valid/invalid counts and error details
        """
        # Validate file type
        if not self.validate_file_type(filename):
            return {
                'valid': False,
                'error': 'Only CSV and XLSX files are supported',
                'total_rows': 0,
                'valid_rows': 0,
                'invalid_rows': 0,
                'errors': []
            }
        
        # Parse file
        try:
            rows, headers = self.parse_file(file_obj, filename)
        except Exception as e:
            return {
                'valid': False,
                'error': f'Failed to parse file: {str(e)}',
                'total_rows': 0,
                'valid_rows': 0,
                'invalid_rows': 0,
                'errors': []
            }
        
        # Validate schema
        schema_errors = self.validate_schema(headers)
        if schema_errors:
            return {
                'valid': False,
                'error': schema_errors[0],
                'total_rows': len(rows),
                'valid_rows': 0,
                'invalid_rows': len(rows),
                'errors': [{'row': 0, 'errors': schema_errors}]
            }
        
        # Validate each row
        valid_rows = []
        invalid_rows = []
        error_details = []
        
        for idx, row in enumerate(rows, start=2):  # Start at 2 (row 1 is headers)
            is_valid, errors, normalized_data = self.validate_row(row, idx)
            
            if is_valid:
                valid_rows.append({
                    'row_number': idx,
                    'data': normalized_data
                })
            else:
                invalid_rows.append(idx)
                error_details.append({
                    'row': idx,
                    'errors': errors,
                    'data': row
                })
        
        return {
            'valid': True,
            'total_rows': len(rows),
            'valid_rows': len(valid_rows),
            'invalid_rows': len(invalid_rows),
            'valid_data': valid_rows,
            'error_details': error_details
        }
    
    def execute_import(self, valid_data: List[Dict], batch: VendorImportBatch, user) -> Dict[str, int]:
        """
        Execute the import using high-performance bulk operations
        """
        from django.db.models import Max
        from django.db import transaction
        import traceback
        stats = {'created': 0, 'updated': 0, 'failed': 0}
        
        batch.status = 'processing'
        batch.save()
        
        all_emails = [item['data'].get('email') for item in valid_data if item['data'].get('email')]
        existing_vendors_map = {
            v.email.lower(): v for v in Vendor.objects.filter(email__in=all_emails)
        }
        
        max_yard_id = Vendor.objects.aggregate(max_id=Max('yard_id'))['max_id'] or 10000
        next_yard_id = max_yard_id + 1
        
        vendors_to_create = []
        vendors_to_update = []
        records_to_create = []
        
        # Track which vendors were processed to avoid duplicates in same batch
        processed_emails = set()

        try:
            for item in valid_data:
                row_number = item['row_number']
                data = item['data']
                email = data.get('email', '').lower()
                
                if email in processed_emails:
                    # If an email appears multiple times in the same batch,
                    # we only process the first occurrence for vendor creation/update
                    # but still record the attempt for subsequent rows.
                    # This prevents trying to create/update the same vendor multiple times
                    # within the same bulk operation.
                    # For simplicity, we'll just skip the vendor processing for duplicates
                    # and assume the first one handled it.
                    # A more robust solution might involve updating the same vendor object
                    # multiple times in `vendors_to_update` if the data changes,
                    # but for now, we'll just record the first valid one.
                    records_to_create.append(VendorImportRecord(
                        batch=batch,
                        vendor=existing_vendors_map.get(email), # Link to the vendor if it exists
                        action='skipped_duplicate',
                        row_number=row_number,
                        error_message=f"Duplicate email '{email}' in batch, already processed."
                    ))
                    continue
                processed_emails.add(email)

                try:
                    existing_vendor = existing_vendors_map.get(email)
                    
                    if existing_vendor:
                        # Store previous state for rollback
                        previous_state = {
                            'yard_id': existing_vendor.yard_id,
                            'name': existing_vendor.name,
                            'email': existing_vendor.email,
                            'phone': existing_vendor.phone,
                            'address': existing_vendor.address,
                            'city': existing_vendor.city,
                            'state': existing_vendor.state,
                            'zip_code': existing_vendor.zip_code,
                            'description': existing_vendor.description,
                            'is_active': existing_vendor.is_active,
                            'is_featured': existing_vendor.is_featured,
                            'is_top_rated': existing_vendor.is_top_rated,
                            'rating_stars': existing_vendor.rating_stars,
                            'rating_percentage': existing_vendor.rating_percentage,
                            'website': existing_vendor.website,
                        }
                        
                        # Update vendor object
                        changed = False
                        for field, value in data.items():
                            if field != 'yard_id' and getattr(existing_vendor, field) != value:
                                setattr(existing_vendor, field, value)
                                changed = True
                        
                        if changed:
                            vendors_to_update.append(existing_vendor)
                            stats['updated'] += 1
                        
                        # We still create a record for every row
                        records_to_create.append(VendorImportRecord(
                            batch=batch,
                            vendor=existing_vendor,
                            action='updated',
                            row_number=row_number,
                            previous_state=previous_state
                        ))
                    else:
                        # Prepare for creation
                        if 'yard_id' not in data or not data['yard_id']:
                            data['yard_id'] = next_yard_id
                            next_yard_id += 1
                        
                        new_vendor = Vendor(**data)
                        vendors_to_create.append(new_vendor)
                        stats['created'] += 1
                        
                        # Note: We can't batch records yet because new_vendor has no ID
                        # We'll do this in a second pass after bulk_create
                except Exception as e:
                    records_to_create.append(VendorImportRecord(
                        batch=batch,
                        vendor=None,
                        action='failed',
                        row_number=row_number,
                        error_message=str(e)
                    ))
                    stats['failed'] += 1

            # Execute Bulk Operations
            with transaction.atomic():
                # 1. Bulk Create New Vendors
                if vendors_to_create:
                    created_vendors = Vendor.objects.bulk_create(vendors_to_create)
                    # Add records for created vendors
                    # Since we used bulk_create, we need to match them back or just trust order 
                    # (Django >= 4.0 returns PKs in bulk_create for most DBs including SQLite/Postgres)
                    # For simplicity, we'll assume order is preserved and link records to created vendors.
                    # A more robust solution might involve storing original row_number in vendors_to_create
                    # and then matching.
                    # For now, we'll iterate through valid_data again to find the corresponding row_number
                    # for newly created vendors.
                    
                    # Create a map from email to the newly created vendor object
                    newly_created_vendors_map = {v.email.lower(): v for v in created_vendors}

                    for item in valid_data:
                        row_number = item['row_number']
                        data = item['data']
                        email = data.get('email', '').lower()
                        
                        if email in newly_created_vendors_map:
                            # Find the record that corresponds to this creation
                            # This is a bit inefficient, ideally we'd store row_number with vendors_to_create
                            # For now, we'll add a new record for the created vendor.
                            # The previous `records_to_create` for new vendors were placeholders.
                            # We need to ensure we don't duplicate records.
                            # A better approach is to build `records_to_create` *after* bulk_create.
                            # Let's rebuild the records_to_create list more carefully.
                            pass # We'll handle records_to_create in a single pass below

                # 2. Bulk Update Existing
                if vendors_to_update:
                    # Get the list of fields that could have been updated
                    # This assumes all vendors_to_update have the same set of keys in their 'data'
                    # from the original row. A safer approach is to define the fields explicitly.
                    # For now, we'll use a common set of updatable fields.
                    updatable_fields = [
                        'name', 'email', 'phone', 'address', 'city', 'state', 'zip_code',
                        'description', 'is_active', 'is_featured', 'is_top_rated',
                        'rating_stars', 'rating_percentage', 'website'
                    ]
                    Vendor.objects.bulk_update(vendors_to_update, updatable_fields)

                # Reconstruct records_to_create to correctly link created vendors
                final_records_to_create = []
                created_vendor_email_to_obj = {v.email.lower(): v for v in vendors_to_create} # Use the objects from bulk_create
                
                for item in valid_data:
                    row_number = item['row_number']
                    data = item['data']
                    email = data.get('email', '').lower()

                    if email in created_vendor_email_to_obj:
                        final_records_to_create.append(VendorImportRecord(
                            batch=batch,
                            vendor=created_vendor_email_to_obj[email],
                            action='created',
                            row_number=row_number,
                            previous_state=None
                        ))
                    elif email in existing_vendors_map:
                        # This vendor was updated or skipped as duplicate
                        # Find the corresponding record from the initial pass
                        # This is tricky. The initial `records_to_create` already contains these.
                        # Let's just append the failed/skipped records and then the created ones.
                        pass # We'll handle this by filtering the original records_to_create

                # Filter out placeholder records for new vendors and add the correctly linked ones
                # This requires a more complex restructuring of the initial loop.
                # For simplicity, let's assume the `records_to_create` list built in the first pass
                # is mostly correct, and we just need to update the `vendor` field for 'created' actions.
                
                # A better way:
                # 1. Process all valid_data, identify create/update, and build `vendors_to_create`, `vendors_to_update`.
                #    Also, build a temporary list of `record_data` (dict) for all rows, including failures.
                # 2. Perform `bulk_create` and `bulk_update`.
                # 3. After `bulk_create`, update the `vendor` field in `record_data` for created vendors.
                # 4. Perform `bulk_create` for `VendorImportRecord` using the `record_data`.

                # Let's refine the record creation logic:
                temp_records_data = [] # Store dicts with all info needed for VendorImportRecord
                
                # Reset stats for accurate counting after bulk operations
                stats = {'created': 0, 'updated': 0, 'failed': 0}
                
                # Re-process valid_data to build records and link vendors
                # This is a bit redundant but ensures correct linking after bulk_create
                for item in valid_data:
                    row_number = item['row_number']
                    data = item['data']
                    email = data.get('email', '').lower()

                    try:
                        existing_vendor = existing_vendors_map.get(email)
                        
                        if existing_vendor:
                            # Check if this vendor was actually updated in vendors_to_update
                            # (i.e., if 'changed' was True for it)
                            is_actually_updated = any(v.pk == existing_vendor.pk for v in vendors_to_update)
                            
                            if is_actually_updated:
                                action = 'updated'
                                stats['updated'] += 1
                            else:
                                action = 'no_change' # Or 'skipped_duplicate' if that's the case
                            
                            previous_state = {
                                'yard_id': existing_vendor.yard_id,
                                'name': existing_vendor.name,
                                'email': existing_vendor.email,
                                'phone': existing_vendor.phone,
                                'address': existing_vendor.address,
                                'city': existing_vendor.city,
                                'state': existing_vendor.state,
                                'zip_code': existing_vendor.zip_code,
                                'description': existing_vendor.description,
                                'is_active': existing_vendor.is_active,
                                'is_featured': existing_vendor.is_featured,
                                'is_top_rated': existing_vendor.is_top_rated,
                                'rating_stars': existing_vendor.rating_stars,
                                'rating_percentage': existing_vendor.rating_percentage,
                                'website': existing_vendor.website,
                            } if action == 'updated' else None # Only store previous state if actually updated
                            
                            temp_records_data.append(VendorImportRecord(
                                batch=batch,
                                vendor=existing_vendor,
                                action=action,
                                row_number=row_number,
                                previous_state=previous_state
                            ))
                        else:
                            # This was a new vendor, find it in the created_vendors list
                            created_vendor_obj = created_vendor_email_to_obj.get(email)
                            if created_vendor_obj:
                                temp_records_data.append(VendorImportRecord(
                                    batch=batch,
                                    vendor=created_vendor_obj,
                                    action='created',
                                    row_number=row_number,
                                    previous_state=None
                                ))
                                stats['created'] += 1
                            else:
                                # This case should ideally not happen if logic is perfect
                                # It means a new vendor was expected but not found in created_vendors
                                temp_records_data.append(VendorImportRecord(
                                    batch=batch,
                                    vendor=None,
                                    action='failed',
                                    row_number=row_number,
                                    error_message="Vendor expected to be created but not found."
                                ))
                                stats['failed'] += 1
                    except Exception as e:
                        temp_records_data.append(VendorImportRecord(
                            batch=batch,
                            vendor=None,
                            action='failed',
                            row_number=row_number,
                            error_message=f"Error during record creation: {str(e)}"
                        ))
                        stats['failed'] += 1

                # 3. Bulk Create Import Records
                if temp_records_data:
                    VendorImportRecord.objects.bulk_create(temp_records_data)
            
            batch.status = 'completed'
            batch.completed_at = timezone.now()
            batch.save()
            
        except Exception as e:
            traceback.print_exc()
            batch.status = 'failed'
            batch.save()
            raise e
        
        return stats
    
    def rollback_import(self, batch: VendorImportBatch) -> Dict[str, int]:
        """
        Rollback an import batch
        Deletes created vendors and restores updated vendors
        """
        stats = {'deleted': 0, 'restored': 0, 'failed': 0}
        
        if batch.status == 'rolled_back':
            raise ValueError("This batch has already been rolled back")
        
        records = VendorImportRecord.objects.filter(batch=batch, action__in=['created', 'updated'])
        
        for record in records:
            try:
                if record.action == 'created' and record.vendor:
                    # Delete newly created vendor
                    record.vendor.delete()
                    stats['deleted'] += 1
                    
                elif record.action == 'updated' and record.vendor and record.previous_state:
                    # Restore previous state
                    for field, value in record.previous_state.items():
                        setattr(record.vendor, field, value)
                    record.vendor.save()
                    stats['restored'] += 1
            except Exception as e:
                stats['failed'] += 1
        
        # Mark batch as rolled back
        batch.status = 'rolled_back'
        batch.save()
        
        return stats
