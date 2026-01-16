"""
Password reset functionality for vendor portal
"""

from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from apps.users.models import User


class VendorPasswordResetRequestView(APIView):
    """
    Request password reset for vendor users
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        
        if not email:
            return Response({
                'error': 'Email is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email, user_type='vendor')
        except User.DoesNotExist:
            # For security, don't reveal if email exists
            return Response({
                'message': 'If a vendor account exists with this email, you will receive password reset instructions.'
            }, status=status.HTTP_200_OK)
        
        # Generate reset token
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        # Create reset link
        reset_link = f"{settings.FRONTEND_URL}/vendor/reset-password/{uid}/{token}/"
        
        # Send email
        subject = 'Reset Your Vendor Portal Password'
        message = f"""
Hello {user.first_name or 'Vendor'},

You requested to reset your password for the JYNM Vendor Portal.

Click the link below to reset your password:
{reset_link}

This link will expire in 24 hours.

If you didn't request this, please ignore this email.

---
JYNM Vendor Portal
        """
        
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
            print(f"✓ Password reset email sent to {user.email}")
            print(f"Reset link: {reset_link}")  # For testing
        except Exception as e:
            print(f"✗ Failed to send email: {str(e)}")
            # Still return success for security
        
        return Response({
            'message': 'If a vendor account exists with this email, you will receive password reset instructions.'
        }, status=status.HTTP_200_OK)


class VendorPasswordResetConfirmView(APIView):
    """
    Confirm password reset with token
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        uid = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('new_password')
        
        if not all([uid, token, new_password]):
            return Response({
                'error': 'Missing required fields'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Decode user ID
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id, user_type='vendor')
            
            # Verify token
            if not default_token_generator.check_token(user, token):
                return Response({
                    'error': 'Invalid or expired reset link'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Set new password
            user.set_password(new_password)
            user.save()
            
            print(f"✓ Password reset successful for {user.email}")
            
            return Response({
                'message': 'Password reset successful. You can now login with your new password.'
            }, status=status.HTTP_200_OK)
            
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({
                'error': 'Invalid reset link'
            }, status=status.HTTP_400_BAD_REQUEST)
