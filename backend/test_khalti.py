import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import RequestFactory
from transactions.views import TransactionViewSet
from transactions.models import Transaction
from accounts.models import User
import json

def test_khalti():
    # Get any transaction
    transaction = Transaction.objects.first()
    if not transaction:
        print("No transactions found.")
        return

    print(f"Testing transaction: {transaction.id}")
    
    factory = RequestFactory()
    request = factory.post(
        f'/api/transactions/{transaction.id}/khalti-initiate/',
        data=json.dumps({"return_url": "http://localhost:3000/success"}),
        content_type='application/json'
    )
    
    # Mock authenticated user
    request.user = transaction.buyer
    
    view = TransactionViewSet.as_view({'post': 'khalti_initiate'})
    response = view(request, pk=transaction.id)
    
    print("\n--- RESPONSE ---")
    print(f"Status: {response.status_code}")
    print(f"Data: {response.data}")

if __name__ == '__main__':
    test_khalti()
