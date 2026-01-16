from rest_framework import permissions


class IsVendorUser(permissions.BasePermission):
    """
    Permission check: User must have user_type='vendor'
    """
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.user_type == 'vendor'
        )


class IsVendorOwner(permissions.BasePermission):
    """
    Permission check: User must own the vendor profile being accessed
    """
    
    def has_permission(self, request, view):
        # First check if user is a vendor
        if not (request.user and request.user.is_authenticated and request.user.user_type == 'vendor'):
            return False
        
        # Check if user has a vendor profile
        try:
            request.user.vendor_profile
            return True
        except:
            return False
    
    def has_object_permission(self, request, view, obj):
        # Check if the object belongs to the user's vendor
        try:
            user_vendor = request.user.vendor_profile.vendor
            
            # Handle different object types
            if hasattr(obj, 'vendor'):
                return obj.vendor == user_vendor
            elif obj.__class__.__name__ == 'Vendor':
                return obj == user_vendor
            elif obj.__class__.__name__ == 'Lead':
                # For leads, check if vendor is assigned (future enhancement)
                # For now, allow all vendors to see all leads (will be filtered in view)
                return True
            
            return False
        except:
            return False


class CanManageInventory(permissions.BasePermission):
    """
    Permission check: Vendor has inventory management permissions
    """
    
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated and request.user.user_type == 'vendor'):
            return False
        
        try:
            vendor_profile = request.user.vendor_profile
            # Check if vendor profile has inventory management permission
            # Default to True if field doesn't exist yet
            return getattr(vendor_profile, 'can_manage_inventory', True)
        except:
            return False
