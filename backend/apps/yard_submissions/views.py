from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.conf import settings
from .models import YardSubmission
from .serializers import (
    YardSubmissionSerializer,
    YardSubmissionCreateSerializer,
    YardSubmissionAdminSerializer
)
from .emails import (
    send_submission_confirmation,
    send_admin_submission_alert,
    send_approval_email,
    send_rejection_email,
)
import json


class IsAdminUser(permissions.BasePermission):
    """Custom permission for admin-only endpoints"""
    def has_permission(self, request, view):
        return request.user and request.user.is_staff


class YardSubmissionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for yard submissions
    - Public: POST (create submission)
    - Admin: GET, PATCH, DELETE
    """
    queryset = YardSubmission.objects.all()

    def get_serializer_class(self):
        if self.action == 'create':
            return YardSubmissionCreateSerializer
        elif self.request.user and self.request.user.is_staff:
            return YardSubmissionAdminSerializer
        return YardSubmissionSerializer

    def get_permissions(self):
        """Allow public creation, admin for everything else"""
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [IsAdminUser()]

    def create(self, request, *args, **kwargs):
        """Create new yard submission — supports both JSON and multipart/form-data"""
        import logging
        logger = logging.getLogger(__name__)

        # If data arrives as multipart/form-data, handle JSON fields that may be strings
        data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)

        # Parse JSON fields that can arrive as strings via FormData
        for field in ('payment_methods', 'business_hours'):
            if field in data and isinstance(data[field], str):
                try:
                    data[field] = json.loads(data[field])
                except (json.JSONDecodeError, TypeError):
                    data[field] = [] if field == 'payment_methods' else {}

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        submission = serializer.save()

        # Handle uploaded photo files (from multipart form upload)
        photo_files = request.FILES.getlist('photos')
        if photo_files:
            import os
            from django.core.files.storage import default_storage
            saved_urls = []
            for f in photo_files:
                fname = f"submissions/{submission.id}/{f.name}"
                path = default_storage.save(fname, f)
                url = request.build_absolute_uri(f"{settings.MEDIA_URL}{path}")
                saved_urls.append({"url": url, "path": path})
            submission.images = saved_urls
            submission.save(update_fields=['images'])

        # Email 1: Submission confirmation to vendor
        try:
            send_submission_confirmation(submission)
        except Exception as e:
            logger.warning(f"Vendor confirmation email failed: {e}")

        # Email 2: Admin alert
        try:
            send_admin_submission_alert(submission)
        except Exception as e:
            logger.warning(f"Admin alert email failed: {e}")

        return Response(
            {
                'message': 'Your yard submission has been received! We will review it shortly.',
                'submission_id': submission.id
            },
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def approve(self, request, pk=None):
        """Approve submission and create vendor"""
        submission = self.get_object()

        if submission.status != 'pending':
            return Response(
                {'error': 'Only pending submissions can be approved'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check for duplicate vendors
        from apps.hollander.models import Vendor
        existing = Vendor.objects.filter(
            name__iexact=submission.business_name,
            city__iexact=submission.city
        ).first()

        if existing:
            return Response(
                {
                    'error': 'Potential duplicate vendor found',
                    'existing_vendor_id': existing.id,
                    'existing_vendor_name': existing.name
                },
                status=status.HTTP_409_CONFLICT
            )

        try:
            # Create vendor from submission
            vendor = self.create_vendor_from_submission(submission)

            # Mark submission as approved
            submission.mark_as_approved(
                admin_user=request.user.username if request.user else None
            )
            submission.created_vendor = vendor
            submission.save()

            # Email 3: Approval confirmation to vendor
            try:
                send_approval_email(submission)
            except Exception as e:
                import logging
                logging.getLogger(__name__).error(f"Failed to send approval email: {e}")

            return Response({
                'message': 'Submission approved and vendor created',
                'vendor_id': vendor.id,
                'submission_id': submission.id
            }, status=status.HTTP_200_OK)

        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"Error approving submission: {e}", exc_info=True)
            return Response({
                'error': 'An internal server error occurred while creating the vendor.',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def reject(self, request, pk=None):
        """Reject submission"""
        submission = self.get_object()

        if submission.status != 'pending':
            return Response(
                {'error': 'Only pending submissions can be rejected'},
                status=status.HTTP_400_BAD_REQUEST
            )

        notes = request.data.get('notes', '')
        submission.mark_as_rejected(
            admin_user=request.user.username if request.user else None,
            notes=notes
        )

        # Email 4: Rejection email to vendor
        try:
            send_rejection_email(submission, notes)
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning(f"Rejection email failed: {e}")

        return Response({
            'message': 'Submission rejected',
            'submission_id': submission.id
        })

    def create_vendor_from_submission(self, submission):
        """Create a Vendor from approved submission"""
        from apps.hollander.models import Vendor
        from django.utils.text import slugify

        # Generate slug
        base_slug = slugify(submission.business_name)
        slug = base_slug
        counter = 1
        while Vendor.objects.filter(profile_url=f'/vendors/{slug}').exists():
            slug = f"{base_slug}-{counter}"
            counter += 1

        # Generate next yard_id
        from django.db.models import Max
        max_yard_id = Vendor.objects.aggregate(max_id=Max('yard_id'))['max_id']
        next_yard_id = (max_yard_id or 0) + 1

        vendor = Vendor.objects.create(
            yard_id=next_yard_id,
            name=submission.business_name,
            address=submission.address,
            city=submission.city,
            state=submission.state,
            zip_code=submission.zip_code,
            phone=submission.phone,
            email=submission.email,
            website=submission.website,
            description=submission.description,
            services=submission.services,
            brands=submission.brands,
            profile_url=f'/vendors/{slug}',
            logo=submission.logo if submission.logo else None,
            images=submission.images if submission.images else [],
            rating="100%",
            is_trusted=False
        )

        return vendor
