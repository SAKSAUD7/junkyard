from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import re
from django.db import connections

class VinDecodeView(APIView):
    authentication_classes = [] 
    permission_classes = []

    def post(self, request):
        vin = request.data.get('vin', '').strip().upper()
        
        # 1. Validation
        if not vin:
            return Response({'success': False, 'error': 'VIN is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Remove whitespace
        vin = re.sub(r'\s+', '', vin)
        
        # Reject I, O, Q unless it's an older VIN? NHTSA says valid standard VINs exclude I, O, Q
        if re.search(r'[IOQ]', vin):
            return Response({'success': False, 'error': 'VIN cannot contain I, O, or Q'}, status=status.HTTP_400_BAD_REQUEST)
            
        if len(vin) != 17:
             return Response({'success': False, 'error': 'VIN must be exactly 17 characters'}, status=status.HTTP_400_BAD_REQUEST)
             
        if not re.match(r'^[A-Z0-9]+$', vin):
            return Response({'success': False, 'error': 'VIN can only contain alphanumeric characters'}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Database decode
        structured_info = {
            'year': None,
            'make': None,
            'model': None,
            'trim': None,
            'series': None,
            'bodyClass': None,
            'vehicleType': None,
            'driveType': None,
            'fuelType': None,
            'engine': None,
            'transmission': None
        }
        
        try:
            with connections['vpic_db'].cursor() as cursor:
                cursor.execute("SELECT variable, value FROM vpic.spVinDecode(%s);", [vin])
                rows = cursor.fetchall()
                
                # Transform results
                has_error = False
                error_text = None
                
                for variable, value in rows:
                    if not value or value.strip() == '' or value == 'Not Applicable':
                        continue
                        
                    var_lower = variable.lower()
                    
                    if var_lower == 'error text':
                        # Ignore "0 - VIN decoded clean"
                        if not value.startswith("0 -"):
                            has_error = True
                            error_text = value
                    elif var_lower == 'model year':
                        structured_info['year'] = value
                    elif var_lower == 'make':
                        structured_info['make'] = value
                    elif var_lower == 'model':
                        structured_info['model'] = value
                    elif var_lower == 'trim':
                        structured_info['trim'] = value
                    elif var_lower == 'series':
                        structured_info['series'] = value
                    elif var_lower == 'body class':
                        structured_info['bodyClass'] = value
                    elif var_lower == 'vehicle type':
                        structured_info['vehicleType'] = value
                    elif var_lower == 'drive type':
                        structured_info['driveType'] = value
                    elif var_lower == 'fuel type - primary':
                        structured_info['fuelType'] = value
                    elif var_lower == 'displacement (cc)' or var_lower == 'engine model':
                        structured_info['engine'] = value # Can combine if both exist
                    elif var_lower == 'transmission style':
                        structured_info['transmission'] = value

            if has_error and not structured_info['make']: 
                # If there's an error and we couldn't even determine the Make, fail early
                return Response({'success': False, 'error': error_text, 'source': 'local_vpic'}, status=status.HTTP_400_BAD_REQUEST)

            return Response({
                'success': True,
                'vin': vin,
                'vehicle': structured_info,
                'source': 'local_vpic',
                'internal_error': error_text if has_error else None
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'success': False, 'error': 'Database decoding failed', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
