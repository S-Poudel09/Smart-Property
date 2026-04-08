from rest_framework import serializers
from .models import Transaction, PaymentProof
from properties.models import Property as PropertyModel
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
    
    # Aliases for creation - support both current mobile and user-suggested payloads
    user_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), source='buyer', write_only=True, required=False)
    property_id = serializers.PrimaryKeyRelatedField(queryset=PropertyModel.objects.all(), source='property', write_only=True, required=False)
    transaction_amount = serializers.DecimalField(source='total_amount', max_digits=15, decimal_places=2, write_only=True, required=False)
    amount = serializers.DecimalField(source='total_amount', max_digits=15, decimal_places=2, write_only=True, required=False)
    
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
            'property', 'seller', 'user_id', 'property_id', 'transaction_amount', 'amount',
            'card_brand', 'card_type', 'card_on_dark_web', 'has_chip'
        )
        extra_kwargs = {
            'property': {'write_only': True, 'required': False},
            'seller': {'write_only': True, 'required': False},
            'total_amount': {'required': False},
        }

    def validate_total_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value

    def to_internal_value(self, data):
        # We need a mutable copy since data is usually an immutable QueryDict when sent via POST
        data = data.copy()
        
        # Consolidate amount
        if 'total_amount' not in data:
            amt = data.get('transaction_amount') or data.get('amount')
            if amt:
                data['total_amount'] = amt
                
        # Handle status capitalization
        if 'status' in data and data['status']:
            data['status'] = str(data['status']).upper()
            
        return super().to_internal_value(data)

    def validate(self, data):
        # Ensure either the original names or aliases are provided
        if not data.get('property') and not self.initial_data.get('property_id'):
            raise serializers.ValidationError({"property": "This field is required."})
        
        if not data.get('total_amount'):
            raise serializers.ValidationError({"total_amount": "This field is required."})
        
        return data
