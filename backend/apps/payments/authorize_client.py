import os
import requests
import json
from decimal import Decimal

# Helper to interact with Authorize.net
def charge_card(nonce, amount, ref_id=""):
    """
    Charge a card using Authorize.net Accept.js opaque data (nonce).
    """
    login_id = os.environ.get('AUTHORIZENET_API_LOGIN_ID')
    transaction_key = os.environ.get('AUTHORIZENET_TRANSACTION_KEY')
    environment = os.environ.get('AUTHORIZENET_ENVIRONMENT', 'sandbox')

    if not login_id or not transaction_key:
        # If no keys, return a mock success for testing while waiting for keys
        return {
            'success': True,
            'transaction_id': 'mock_' + os.urandom(4).hex(),
            'auth_code': 'MOCK123',
            'response_code': '1',
            'full_response': {'message': 'MOCK SUCCESS (No API Keys provided)'}
        }

    url = 'https://apitest.authorize.net/xml/v1/request.api'
    if environment == 'production':
        url = 'https://api.authorize.net/xml/v1/request.api'

    payload = {
        "createTransactionRequest": {
            "merchantAuthentication": {
                "name": login_id,
                "transactionKey": transaction_key
            },
            "refId": ref_id,
            "transactionRequest": {
                "transactionType": "authCaptureTransaction",
                "amount": str(amount),
                "payment": {
                    "opaqueData": {
                        "dataDescriptor": "COMMON.ACCEPT.INAPP.PAYMENT",
                        "dataValue": nonce
                    }
                }
            }
        }
    }

    try:
        response = requests.post(url, json=payload, headers={'Content-Type': 'application/json'}, timeout=15)
        data = response.json()
        
        messages = data.get('messages', {})
        result_code = messages.get('resultCode')
        
        transaction_response = data.get('transactionResponse', {})
        response_code = transaction_response.get('responseCode')
        
        # 1 = Approved
        if result_code == 'Ok' and response_code == '1':
            return {
                'success': True,
                'transaction_id': transaction_response.get('transId'),
                'auth_code': transaction_response.get('authCode'),
                'response_code': response_code,
                'full_response': data
            }
        else:
            # Get error message
            error_message = "Payment declined"
            if transaction_response.get('errors'):
                error_message = transaction_response['errors'][0].get('errorText')
            elif messages.get('message'):
                error_message = messages['message'][0].get('text')
                
            return {
                'success': False,
                'transaction_id': transaction_response.get('transId'),
                'error': error_message,
                'response_code': response_code,
                'full_response': data
            }
            
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'full_response': None
        }
