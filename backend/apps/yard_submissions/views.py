from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from .models import YardSubmission
from .serializers import (
    YardSubmissionSerializer,
    YardSubmissionCreateSerializer,
    YardSubmissionAdminSerializer
)


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
        """Allow public POST, require admin for everything else"""
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [IsAdminUser()]
    
    def create(self, request, *args, **kwargs):
        """Create new yard submission"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        submission = serializer.save()
        
        # Send email notification to admin
        try:
            self.send_admin_notification(submission)
        except Exception as e:
            # Log error but don't fail the request
            print(f"Failed to send admin notification: {e}")
        
        return Response(
            {
                'message': 'Your yard submission has been received! We will review it shortly.',
                'submission_id': submission.id
            },
            status=status.HTTP_201_CREATED
        )
    
    def send_admin_notification(self, submission):
        """Send email to admin about new submission"""
        subject = f'New Yard Submission: {submission.business_name}'
        message = f"""
New yard submission received:

Business: {submission.business_name}
Contact: {submission.contact_name}
Email: {submission.email}
Phone: {submission.phone}
Location: {submission.city}, {submission.state}

Review at: {settings.SITE_URL}/admin/yard_submissions/yardsubmission/{submission.id}/change/
        """
        
        admin_email = getattr(settings, 'ADMIN_EMAIL', 'admin@example.com')
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [admin_email],
            fail_silently=True,
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
        
        # Create vendor from submission
        vendor = self.create_vendor_from_submission(submission)
        
        # Mark submission as approved
        submission.mark_as_approved(
            admin_user=request.user.username if request.user else None
        )
        submission.created_vendor = vendor
        submission.save()
        
        # Send confirmation email
        try:
            self.send_approval_email(submission)
        except Exception as e:
            print(f"Failed to send approval email: {e}")
        
        return Response({
            'message': 'Submission approved and vendor created',
            'vendor_id': vendor.id,
            'submission_id': submission.id
        })
    
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
        
        # Send rejection email
        try:
            self.send_rejection_email(submission, notes)
        except Exception as e:
            print(f"Failed to send rejection email: {e}")
        
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
        
        vendor = Vendor.objects.create(
            name=submission.business_name,
            address=submission.address,
            city=submission.city,
            state=submission.state,
            zipcode=submission.zip_code,
            description=submission.description,
            profile_url=f'/vendors/{slug}',
            logo=submission.logo.url if submission.logo else '/images/logo-placeholder.png',
            rating="100%",  # Default rating
            is_trusted=False,  # Can be manually set later
            trust_level=0
        )
        
        return vendor
    
    def send_approval_email(self, submission):
        """Send approval confirmation email"""
        subject = f'Your Yard Listing Has Been Approved!'
        message = f"""
Hi {submission.contact_name},

Great news! Your yard listing for {submission.business_name} has been approved and is now live on our directory.

You can view your listing at: {settings.SITE_URL}{submission.created_vendor.profile_url if submission.created_vendor else ''}

Thank you for joining our marketplace!

Best regards,
The Team
        """
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [submission.email],
            fail_silently=True,
        )
    
    def send_rejection_email(self, submission, notes=''):
        """Send rejection notification email"""
        subject = f'Update on Your Yard Submission'
        message = f"""
Hi {submission.contact_name},

Thank you for submitting {submission.business_name} to our directory.

Unfortunately, we are unable to approve your listing at this time.

{f'Reason: {notes}' if notes else ''}

If you have any questions, please contact us.

Best regards,
The Team
        """
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [submission.email],
            fail_silently=True,
        )
