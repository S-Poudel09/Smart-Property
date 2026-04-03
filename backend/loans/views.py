from rest_framework import viewsets
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from .models import Loan
from .serializers import LoanSerializer, EMICalculationSerializer, LoanEligibilitySerializer, LoanPredictionSerializer
from ml.predict_loan import predict_loan, is_model_loaded


class LoanViewSet(viewsets.ModelViewSet):
    serializer_class = LoanSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.role == 'admin':
            return Loan.objects.all()
        if user.is_authenticated:
            return Loan.objects.filter(user=user)
        return Loan.objects.none()

    @action(detail=False, methods=['post'], url_path='calculate-emi')
    def calculate_emi(self, request):
        serializer = EMICalculationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        amount = float(serializer.validated_data['amount'])
        rate = float(serializer.validated_data['rate'])
        tenure = int(serializer.validated_data['tenure'])
            
        monthly_rate = rate / (12 * 100)
        months = tenure * 12
        
        try:
            emi = (amount * monthly_rate * (1 + monthly_rate)**months) / ((1 + monthly_rate)**months - 1)
            total_payable = emi * months
            total_interest = total_payable - amount
            
            return Response({
                "MonthlyEMI": round(emi, 2),
                "TotalPayable": round(total_payable, 2),
                "TotalInterest": round(total_interest, 2)
            })
        except ZeroDivisionError:
            return Response({"error": "Invalid tenure or rate calculation"}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='check-eligibility')
    def check_eligibility(self, request):
        serializer = LoanEligibilitySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        income = float(serializer.validated_data['income'])
        loan_amount = float(serializer.validated_data['loan_amount'])
        existing_emis = float(serializer.validated_data['existing_emis'])
        
        # Simple rule: Max EMI should be 50% of monthly income
        monthly_income = income / 12
        max_allowed_emi = (monthly_income * 0.5) - existing_emis
        
        # Approximate EMI at 8% for 20 years
        r = 8 / (12 * 100)
        n = 20 * 12
        try:
            estimated_emi = (loan_amount * r * (1 + r)**n) / ((1 + r)**n - 1)
            is_eligible = estimated_emi <= max_allowed_emi
            
            return Response({
                "IsEligible": is_eligible,
                "MaxAllowedEMI": round(max_allowed_emi, 2),
                "EstimatedEMI": round(estimated_emi, 2),
                "Recommendation": "Eligible" if is_eligible else "Required income is lower than debt-to-income ratio limits."
            })
        except ZeroDivisionError:
             return Response({"error": "Calculation error"}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
def loan_prediction(request):
    serializer = LoanPredictionSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if not is_model_loaded():
        return Response({"error": "ML Model not available for prediction"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    try:
        result = predict_loan(
            int(serializer.validated_data["age"]),
            float(serializer.validated_data["income"]),
            int(serializer.validated_data["credit_score"]),
            float(serializer.validated_data["loan_amount"]),
            int(serializer.validated_data["loan_term"]),
            serializer.validated_data["employment_status"],
        )

        prediction = "Loan Approved" if result == 1 else "Loan Rejected"
        return Response({"prediction": prediction})
    except Exception as e:
        return Response({"error": f"Prediction failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)