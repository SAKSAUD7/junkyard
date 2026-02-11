"""
Vendor Import API Views
========================
REST API endpoints for bulk vendor import operations
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.core.files.uploadedfile import UploadedFile
from django.http import HttpResponse
from django.utils import timezone
from django.db import models
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import csv
import io
import uuid
import logging

logger = logging.getLogger(__name__)

from .vendor_import_service import VendorImportService
from .models import Vendor, VendorImportBatch, VendorImportRecord


# Temporary storage for upload previews (in-memory)
# In production, consider using Redis or file storage
UPLOAD_PREVIEWS = {}


@method_decorator(csrf_exempt, name='dispatch')
class VendorImportViewSet(viewsets.ViewSet):
    """
    ViewSet for vendor import operations
    """
    permission_classes = [IsAdminUser]
    authentication_classes = [JWTAuthentication]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    @action(methods=['POST'], detail=False)
    def upload(self, request):
        """
        Upload and validate import file
        Returns preview data with valid/invalid row counts
        """
        print(f"DEBUG: Upload request received. User: {request.user}, Auth: {request.auth}")
        if 'file' not in request.FILES:
            return Response(
                {'error': 'No file provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            global UPLOAD_PREVIEWS  # Fix UnboundLocalError
            file_obj = request.FILES['file']
            filename = file_obj.name
            print(f"DEBUG: Processing file {filename}, Size: {file_obj.size}")
            
            # Validate file size (max 10MB)
            if file_obj.size > 10 * 1024 * 1024:
                return Response(
                    {'error': 'File size exceeds 10MB limit'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Process file
            service = VendorImportService()
            preview = service.process_preview(file_obj, filename)
            
            if not preview['valid']:
                return Response(
                    {
                        'valid': False,
                        'error': preview['error'],
                        'total_rows': preview['total_rows']
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Generate upload ID for confirmation
            upload_id = str(uuid.uuid4())
            
            # Store preview data temporarily
            UPLOAD_PREVIEWS[upload_id] = {
                'filename': filename,
                'preview': preview,
                'timestamp': timezone.now()
            }
            
            # Clean old previews (older than 1 hour)
            cutoff = timezone.now() - timezone.timedelta(hours=1)
            UPLOAD_PREVIEWS = {
                k: v for k, v in UPLOAD_PREVIEWS.items()
                if v['timestamp'] > cutoff
            }
            
            return Response({
                'valid': True,
                'upload_id': upload_id,
                'filename': filename,
                'total_rows': preview['total_rows'],
                'valid_rows': preview['valid_rows'],
                'invalid_rows': preview['invalid_rows'],
                'error_details': preview['error_details']
            })
        except Exception as e:
            import traceback
            traceback.print_exc()
            print(f"ERROR in upload: {str(e)}")
            return Response(
                {'error': f"Server Error: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(methods=['POST'], detail=False)
    def confirm(self, request):
        """
        Execute import with confirmed upload
        Body: {'upload_id': 'xxx'}
        """
        global UPLOAD_PREVIEWS
        try:
            upload_id = request.data.get('upload_id')
            
            if not upload_id or upload_id not in UPLOAD_PREVIEWS:
                return Response(
                    {'error': 'Invalid or expired upload ID'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            upload_data = UPLOAD_PREVIEWS[upload_id]
            preview = upload_data['preview']
            filename = upload_data['filename']
            
            # Create batch record
            batch = VendorImportBatch.objects.create(
                uploaded_by=request.user,
                filename=filename,
                total_rows=preview['total_rows'],
                valid_rows=preview['valid_rows'],
                invalid_rows=preview['invalid_rows'],
                status='processing'
            )
            
            # Execute import
            service = VendorImportService()
            stats = service.execute_import(
                preview['valid_data'],
                batch,
                request.user
            )
            
            # Clean up preview data
            del UPLOAD_PREVIEWS[upload_id]
            
            return Response({
                'success': True,
                'batch_id': str(batch.batch_id),
                'message': f'Import completed: {stats["created"]} created, {stats["updated"]} updated',
                'stats': stats
            })
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response(
                {'error': f'Import failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(methods=['GET'], detail=False)
    def history(self, request):
        """
        List import batch history with pagination
        """
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        
        batches = VendorImportBatch.objects.all().order_by('-created_at')
        
        # Paginate
        start = (page - 1) * page_size
        end = start + page_size
        total_count = batches.count()
        
        batch_list = []
        for batch in batches[start:end]:
            batch_list.append({
                'batch_id': str(batch.batch_id),
                'filename': batch.filename,
                'uploaded_by': batch.uploaded_by.username if batch.uploaded_by else 'Unknown',
                'status': batch.status,
                'total_rows': batch.total_rows,
                'valid_rows': batch.valid_rows,
                'invalid_rows': batch.invalid_rows,
                'created_at': batch.created_at.isoformat(),
                'completed_at': batch.completed_at.isoformat() if batch.completed_at else None
            })
        
        return Response({
            'results': batch_list,
            'count': total_count,
            'page': page,
            'page_size': page_size,
            'total_pages': (total_count + page_size - 1) // page_size
        })
    
    @action(methods=['POST'], detail=True)
    def rollback(self, request, pk=None):
        """
        Rollback an import batch
        """
        try:
            batch = VendorImportBatch.objects.get(batch_id=pk)
        except VendorImportBatch.DoesNotExist:
            return Response(
                {'error': 'Batch not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if batch.status == 'rolled_back':
            return Response(
                {'error': 'This batch has already been rolled back'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if batch.status not in ['completed', 'failed']:
            return Response(
                {'error': f'Cannot rollback batch with status: {batch.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Execute rollback
        service = VendorImportService()
        try:
            stats = service.rollback_import(batch)
            return Response({
                'success': True,
                'message': f'Rollback completed: {stats["deleted"]} deleted, {stats["restored"]} restored',
                'stats': stats
            })
        except Exception as e:
            return Response(
                {'error': f'Rollback failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(methods=['GET'], detail=True)
    def error_report(self, request, pk=None):
        """
        Download error report CSV for a batch
        """
        try:
            batch = VendorImportBatch.objects.get(batch_id=pk)
        except VendorImportBatch.DoesNotExist:
            return Response(
                {'error': 'Batch not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get failed/skipped records
        records = VendorImportRecord.objects.filter(
            batch=batch,
            action__in=['failed', 'skipped']
        ).order_by('row_number')
        
        # Generate CSV
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(['Row Number', 'Error Message'])
        
        for record in records:
            writer.writerow([
                record.row_number,
                record.error_message or 'Validation failed'
            ])
        
        # Create response
        response = HttpResponse(output.getvalue(), content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="import_errors_{pk}.csv"'
        return response
