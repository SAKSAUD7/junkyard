from rest_framework.permissions import BasePermission


class IsAdminOrStaff(BasePermission):
    """
    Allow access to users who are:
      - is_superuser, OR
      - is_staff, OR
      - user_type == 'admin'
    This bypasses Django's strict IsAdminUser which only checks is_staff.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return (
            request.user.is_superuser
            or request.user.is_staff
            or getattr(request.user, 'user_type', '') == 'admin'
        )
