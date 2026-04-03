from rest_framework import serializers
from .models import Loan
from properties.models import Property
from properties.serializers import PropertySerializer

class LoanSerializer(serializers.ModelSerializer):
    LoanID = serializers.UUIDField(source='id', read_only=True)
    UserID = serializers.PrimaryKeyRelatedField(source='user', read_only=True)
    PropertyID = serializers.PrimaryKeyRelatedField(source='property', queryset=Property.objects.all())
    LoanAmount = serializers.DecimalField(source='loan_amount', max_digits=15, decimal_places=2)
    InterestRate = serializers.DecimalField(source='interest_rate', max_digits=5, decimal_places=2)
    LoanStatus = serializers.CharField(source='status', read_only=True)
    ApplicationDate = serializers.DateTimeField(source='application_date', read_only=True)
    ApprovalDate = serializers.DateTimeField(source='approval_date', read_only=True)

    Age = serializers.IntegerField(source='age', required=False)
    CreditScore = serializers.IntegerField(source='credit_score', required=False)
    LoanTerm = serializers.IntegerField(source='loan_term_months', required=False)

    class Meta:
        model = Loan
        fields = (
            'LoanID', 'UserID', 'PropertyID', 'LoanAmount', 
            'InterestRate', 'LoanStatus', 'ApplicationDate', 'ApprovalDate',
            'Age', 'CreditScore', 'LoanTerm'
        )

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

from decimal import Decimal

class EMICalculationSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=15, decimal_places=2, min_value=Decimal("0.01"))
    rate = serializers.DecimalField(max_digits=5, decimal_places=2, min_value=Decimal("0.01"))
    tenure = serializers.IntegerField(min_value=1, max_value=50)

class LoanEligibilitySerializer(serializers.Serializer):
    income = serializers.DecimalField(max_digits=15, decimal_places=2, min_value=Decimal("0"))
    loan_amount = serializers.DecimalField(max_digits=15, decimal_places=2, min_value=Decimal("0"))
    existing_emis = serializers.DecimalField(max_digits=15, decimal_places=2, min_value=Decimal("0"), default=Decimal("0"))

class LoanPredictionSerializer(serializers.Serializer):
    age = serializers.IntegerField(min_value=18, max_value=100)
    income = serializers.DecimalField(max_digits=15, decimal_places=2, min_value=Decimal("0"))
    credit_score = serializers.IntegerField(min_value=300, max_value=900)
    loan_amount = serializers.DecimalField(max_digits=15, decimal_places=2, min_value=Decimal("0"))
    loan_term = serializers.IntegerField(min_value=1, max_value=360) # in months
    employment_status = serializers.ChoiceField(choices=['Employed', 'Unemployed', 'Self-Employed'])
