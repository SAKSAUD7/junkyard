from rest_framework import views, status, permissions
from rest_framework.response import Response
from .authorize_client import charge_card
from .models import Transaction

class ChargeCardView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        nonce = request.data.get('nonce')
        amount = request.data.get('amount')
        item_type = request.data.get('item_type')
        item_id = request.data.get('item_id')

        if not nonce or not amount:
            return Response({'error': 'Nonce and amount are required.'}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Start Transaction Record
        txn = Transaction.objects.create(
            user=request.user,
            amount=amount,
            item_type=item_type,
            item_id=item_id,
            status='pending'
        )

        # 2. Charge using Authorize.net
        result = charge_card(nonce, amount, ref_id=f"TXN_{txn.id}")

        # 3. Handle Result
        if result['success']:
            txn.status = 'completed'
            txn.transaction_id = result.get('transaction_id')
            txn.auth_code = result.get('auth_code')
            txn.response_code = result.get('response_code')
            txn.full_response = result.get('full_response')
            txn.save()

            return Response({
                'success': True, 
                'transaction_id': txn.transaction_id,
                'internal_id': txn.id
            })
        else:
            txn.status = 'failed'
            txn.transaction_id = result.get('transaction_id', '')
            txn.response_code = result.get('response_code', '')
            txn.full_response = result.get('full_response')
            txn.save()

            return Response({'error': result.get('error', 'Payment failed')}, status=status.HTTP_400_BAD_REQUEST)
