from rest_framework import serializers
from .models import Transaction, PaymentProof
from properties.serializers import PropertySerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'first_name', 'last_name', 'email')

class PaymentProofSerializer(serializers.ModelSerializer):
    ProofID = serializers.UUIDField(source='id', read_only=True)
    class Meta:
        model = PaymentProof
        fields = ('ProofID', 'proof_file', 'amount', 'is_verified', 'notes', 'created_at')

class TransactionSerializer(serializers.ModelSerializer):
    TransactionID = serializers.UUIDField(source='id', read_only=True)
    Buyer = UserSimpleSerializer(source='buyer', read_only=True)
    Seller = UserSimpleSerializer(source='seller', read_only=True)
    Property = PropertySerializer(source='property', read_only=True)
    Proofs = PaymentProofSerializer(source='proofs', many=True, read_only=True)
    
    Progress = serializers.SerializerMethodField()
    
    def get_Progress(self, obj):
        if obj.total_amount > 0:
            return float((obj.amount_paid / obj.total_amount) * 100)
        return 0

    class Meta:
        model = Transaction
        fields = (
            'TransactionID', 'Buyer', 'Seller', 'Property', 'Proofs', 
            'total_amount', 'amount_paid', 'payment_method', 'transaction_reference_id',
            'status', 'Progress', 'created_at', 'updated_at',
            'property', 'seller',
            'card_brand', 'card_type', 'card_on_dark_web', 'has_chip'
        )
        extra_kwargs = {
            'property': {'write_only': True},
            'seller': {'write_only': True},
        }
