from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from .models import User, VendorProfile
from apps.common.models import SiteAnalytics
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    ChangePasswordSerializer,
    VendorProfileSerializer
)


from rest_framework.throttling import ScopedRateThrottle

class RegisterView(generics.CreateAPIView):
    throttle_scope = 'auth'
    throttle_classes = [ScopedRateThrottle]
    """User registration endpoint"""
    
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Send Welcome Email
        if user.user_type == 'customer':
            try:
                subject = "Welcome to Junkyards Near Me!"
                message = f"Hi {user.first_name or user.username},\n\nWelcome to Junkyards Near Me! Your buyer account has been successfully created.\nYou can now connect with our verified auto salvage yards nationwide.\n\nBest regards,\nThe JYNM Team"
                send_mail(
                    subject,
                    message,
                    getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@junkyardsnearme.com'),
                    [user.email],
                    fail_silently=True,
                )
            except Exception as e:
                print(f"Failed to send welcome email to {user.email}: {e}")
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        # Track signup event
        try:
            ip = request.META.get('REMOTE_ADDR') or request.META.get('HTTP_X_FORWARDED_FOR', '').split(',')[0].strip() or None
            SiteAnalytics.objects.create(
                event_type='signup',
                user_type=user.user_type or 'customer',
                user_email=user.email,
                ip_address=ip,
                metadata={'user_id': user.id}
            )
        except Exception:
            pass

        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'User registered successfully'
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    throttle_scope = 'auth'
    throttle_classes = [ScopedRateThrottle]
    """User login endpoint"""
    
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response({
                'error': 'Please provide both email and password'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Authenticate user. A caller may provide an expected account type so a
        # customer token can never be silently reused as a vendor/admin session.
        user = authenticate(request=request, email=str(email).strip().lower(), password=password)

        if not user:
            return Response({
                'error': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)

        account_type = str(request.data.get('account_type') or '').strip().lower()
        is_admin = user.is_staff or user.is_superuser or user.user_type == 'admin'
        type_matches = (
            not account_type
            or (account_type == 'admin' and is_admin)
            or (account_type in {'customer', 'vendor'} and user.user_type == account_type)
        )
        if not type_matches:
            return Response({'error': 'This account is not authorized for that sign-in area.'}, status=status.HTTP_403_FORBIDDEN)
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        # Get vendor profile if exists
        vendor_profile = None
        try:
            vendor_profile = VendorProfileSerializer(user.vendor_profile).data
        except:
            pass
        
        # Track login event
        try:
            ip = request.META.get('REMOTE_ADDR') or request.META.get('HTTP_X_FORWARDED_FOR', '').split(',')[0].strip() or None
            SiteAnalytics.objects.create(
                event_type='login',
                user_type=user.user_type or 'customer',
                user_email=user.email,
                ip_address=ip
            )
        except Exception:
            pass

        return Response({
            'user': UserSerializer(user).data,
            'vendor_profile': vendor_profile,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'Login successful'
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """User logout endpoint"""
    
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token') or request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
        except Exception:
            # Token already expired/invalid — still count as logged out
            pass
        return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Get and update user profile"""
    
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer
    
    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    """Change user password"""
    
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        
        if serializer.is_valid():
            user = request.user
            
            # Check old password
            if not user.check_password(serializer.data.get('old_password')):
                return Response({
                    'error': 'Wrong password'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Set new password
            user.set_password(serializer.data.get('new_password'))
            user.save()
            
            return Response({
                'message': 'Password changed successfully'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VendorProfileView(generics.RetrieveAPIView):
    """Get vendor profile for current user"""

    permission_classes = [IsAuthenticated]
    serializer_class = VendorProfileSerializer

    def get_object(self):
        try:
            return self.request.user.vendor_profile
        except VendorProfile.DoesNotExist:
            return None

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance is None:
            return Response({
                'message': 'No vendor profile found'
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class CustomerPasswordResetRequestView(APIView):
    """
    Request password reset for customer users
    """
    permission_classes = [AllowAny]
    throttle_scope = 'auth'
    throttle_classes = [ScopedRateThrottle]

    def post(self, request):
        email = request.data.get('email')

        if not email:
            return Response({
                'error': 'Email is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email, user_type='customer')
        except User.DoesNotExist:
            # For security, don't reveal if email exists
            return Response({
                'message': 'If an account exists with this email, you will receive password reset instructions.'
            }, status=status.HTTP_200_OK)

        # Generate reset token
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))

        # Create reset link using configured frontend URL
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        reset_link = f"{frontend_url}/reset-password/{uid}/{token}/"

        # Send email
        subject = 'Reset Your JYNM Password'
        message = f"""
Hello {user.first_name or 'Customer'},

You requested to reset your password for Junkyards Near Me.

Click the link below to reset your password:
{reset_link}

This link will expire in 24 hours.

If you didn't request this, please ignore this email.

---
Junkyards Near Me Team
        """

        def _send_reset_async():
            try:
                send_mail(
                    subject=subject,
                    message=message,
                    from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@junkyardsnearme.com'),
                    recipient_list=[user.email],
                    fail_silently=False,
                )
                print(f"[OK] Customer password reset email sent to {user.email}")
                print(f"Reset link: {reset_link}")  # For testing
            except Exception as e:
                print(f"[ERROR] Failed to send email: {str(e)}")
                # Still return success for security in the main thread anyway

        import threading
        email_thread = threading.Thread(target=_send_reset_async)
        email_thread.start()

        return Response({
            'message': 'If an account exists with this email, you will receive password reset instructions.'
        }, status=status.HTTP_200_OK)


class CustomerPasswordResetConfirmView(APIView):
    """
    Confirm password reset with token for customers
    """
    permission_classes = [AllowAny]
    throttle_scope = 'auth'
    throttle_classes = [ScopedRateThrottle]

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
            user = User.objects.get(pk=user_id, user_type='customer')

            # Verify token
            if not default_token_generator.check_token(user, token):
                return Response({
                    'error': 'Invalid or expired reset link'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Set new password
            user.set_password(new_password)
            user.save()

            print(f"[OK] Customer password reset successful for {user.email}")

            return Response({
                'message': 'Password reset successful. You can now login with your new password.'
            }, status=status.HTTP_200_OK)

        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({
                'error': 'Invalid reset link'
            }, status=status.HTTP_400_BAD_REQUEST)
