from rest_framework import serializers
from .models import Transaction
from loans.models import Loan
from properties.models import Property

class TransactionSerializer(serializers.ModelSerializer):
    TransactionID = serializers.UUIDField(source='id', read_only=True)
    UserID = serializers.PrimaryKeyRelatedField(source='user', read_only=True)
    LoanID = serializers.PrimaryKeyRelatedField(source='loan', queryset=Loan.objects.all(), required=False, allow_null=True)
    Amount = serializers.DecimalField(source='amount', max_digits=15, decimal_places=2)
    PaymentMethod = serializers.CharField(source='payment_method')
    PaymentDate = serializers.DateTimeField(source='payment_date', read_only=True)
    Status = serializers.CharField(source='status', read_only=True)

    class Meta:
        model = Transaction
        fields = (
            'TransactionID', 'UserID', 'LoanID', 'Amount', 
            'PaymentMethod', 'PaymentDate', 'Status', 'payment_proof_url'
        )

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        # Optionally link to the property from the loan if available
        loan = validated_data.get('loan')
        if loan:
            validated_data['property'] = loan.property
        return super().create(validated_data)
