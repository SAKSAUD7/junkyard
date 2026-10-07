from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import re
import urllib.request
import urllib.error
import json


class VinDecodeView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        vin = request.data.get('vin', '').strip().upper()

        # 1. Validation
        if not vin:
            return Response({'success': False, 'error': 'VIN is required'}, status=status.HTTP_400_BAD_REQUEST)

        vin = re.sub(r'\s+', '', vin)

        if re.search(r'[IOQ]', vin):
            return Response({'success': False, 'error': 'VIN cannot contain I, O, or Q'}, status=status.HTTP_400_BAD_REQUEST)

        if len(vin) != 17:
            return Response({'success': False, 'error': 'VIN must be exactly 17 characters'}, status=status.HTTP_400_BAD_REQUEST)

        if not re.match(r'^[A-Z0-9]+$', vin):
            return Response({'success': False, 'error': 'VIN can only contain alphanumeric characters'}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Try local vpic_db first (optional), fall back to NHTSA API
        local_result = self._try_local_db(vin)
        if local_result:
            return Response(local_result, status=status.HTTP_200_OK)

        # 3. Fall back to NHTSA public API
        nhtsa_result = self._try_nhtsa(vin)
        if nhtsa_result:
            return Response(nhtsa_result, status=status.HTTP_200_OK)

        return Response({
            'success': False,
            'error': 'Unable to decode VIN. Please check the VIN and try again.'
        }, status=status.HTTP_400_BAD_REQUEST)

    def _try_local_db(self, vin):
        """Try to decode via local vpic_db. Returns dict or None on failure."""
        try:
            from django.db import connections
            structured_info = self._empty_vehicle()
            with connections['vpic_db'].cursor() as cursor:
                cursor.execute("SELECT variable, value FROM vpic.spVinDecode(%s);", [vin])
                rows = cursor.fetchall()
                has_error = False
                error_text = None
                for variable, value in rows:
                    if not value or value.strip() == '' or value == 'Not Applicable':
                        continue
                    var_lower = variable.lower()
                    if var_lower == 'error text':
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
                    elif var_lower in ('displacement (cc)', 'engine model'):
                        structured_info['engine'] = value
                    elif var_lower == 'transmission style':
                        structured_info['transmission'] = value

            if has_error and not structured_info['make']:
                return None  # fall through to NHTSA

            return {
                'success': True,
                'vin': vin,
                'vehicle': structured_info,
                'source': 'local_vpic',
                'internal_error': error_text if has_error else None
            }
        except Exception:
            return None  # Fall through to NHTSA

    def _try_nhtsa(self, vin):
        """Decode via NHTSA public vPIC API. Returns dict or None on failure."""
        try:
            url = f"https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/{vin}?format=json"
            req = urllib.request.Request(url, headers={'User-Agent': 'JYNM-VIN-Decoder/1.0'})
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode('utf-8'))

            results = data.get('Results', [])
            if not results:
                return None

            r = results[0]

            # Check for NHTSA error
            error_code = r.get('ErrorCode', '0')
            if error_code and not error_code.startswith('0'):
                error_text = r.get('ErrorText', 'Unknown VIN error')
                return {
                    'success': False,
                    'error': error_text,
                    'source': 'nhtsa'
                }

            def val(key):
                v = r.get(key, '')
                return v if v and v.strip() else None

            # Build engine string
            engine_parts = [val('DisplacementL'), val('EngineCylinders')]
            engine_parts = [p for p in engine_parts if p]
            engine_str = None
            if engine_parts:
                engine_str = f"{engine_parts[0]}L" if len(engine_parts) == 1 else f"{engine_parts[0]}L {engine_parts[1]}-cyl"

            structured_info = {
                'year': val('ModelYear'),
                'make': val('Make'),
                'model': val('Model'),
                'trim': val('Trim'),
                'series': val('Series'),
                'bodyClass': val('BodyClass'),
                'vehicleType': val('VehicleType'),
                'driveType': val('DriveType'),
                'fuelType': val('FuelTypePrimary'),
                'engine': engine_str or val('EngineModel'),
                'transmission': val('TransmissionStyle'),
            }

            if not structured_info['make']:
                return None

            return {
                'success': True,
                'vin': vin,
                'vehicle': structured_info,
                'source': 'nhtsa',
                'internal_error': None
            }
        except Exception:
            return None

    def _empty_vehicle(self):
        return {
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
            'transmission': None,
        }
