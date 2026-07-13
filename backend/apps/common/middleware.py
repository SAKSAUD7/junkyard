from django.http import HttpResponsePermanentRedirect, HttpResponseRedirect
from django.utils.deprecation import MiddlewareMixin
from apps.common.models import CustomRedirect
import logging

logger = logging.getLogger(__name__)

class CustomRedirectMiddleware(MiddlewareMixin):
    """
    Middleware to handle 301/302 redirects stored in the CustomRedirect model.
    It catches 404 responses from the views, and checks if the path exists in CustomRedirect.
    """
    
    def process_response(self, request, response):
        # We only check for redirect if it's a 404
        if response.status_code != 404:
            return response
            
        full_path = request.get_full_path()
        path = request.path
        
        # Check database for this path
        # Fallbacks: check full_path (with query params) then path (without query params)
        redirect_obj = None
        
        try:
            redirect_obj = CustomRedirect.objects.filter(old_path=full_path).first()
            if not redirect_obj and path != full_path:
                 redirect_obj = CustomRedirect.objects.filter(old_path=path).first()
        except Exception as e:
            logger.error(f"Error checking CustomRedirect database: {e}")
            return response
            
        if redirect_obj:
            new_path = redirect_obj.new_path
            
            # Decide 301 vs 302
            if redirect_obj.status_code == 301:
                return HttpResponsePermanentRedirect(new_path)
            else:
                return HttpResponseRedirect(new_path)
                
        return response
