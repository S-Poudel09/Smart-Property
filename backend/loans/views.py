from rest_framework import viewsets
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from .models import Loan
from .serializers import LoanSerializer
from ml.predict_loan import predict_loan


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
        amount = float(request.data.get('amount', 0))
        rate = float(request.data.get('rate', 0)) # annual rate
        tenure = int(request.data.get('tenure', 0)) # in years
        
        if amount <= 0 or rate <= 0 or tenure <= 0:
            return Response({"error": "Invalid inputs"}, status=400)
            
        monthly_rate = rate / (12 * 100)
        months = tenure * 12
        
        emi = (amount * monthly_rate * (1 + monthly_rate)**months) / ((1 + monthly_rate)**months - 1)
        total_payable = emi * months
        total_interest = total_payable - amount
        
        return Response({
            "monthly_emi": round(emi, 2),
            "total_payable": round(total_payable, 2),
            "total_interest": round(total_interest, 2)
        })

    @action(detail=False, methods=['post'], url_path='check-eligibility')
    def check_eligibility(self, request):
        income = float(request.data.get('income', 0))
        loan_amount = float(request.data.get('loan_amount', 0))
        existing_emis = float(request.data.get('existing_emis', 0))
        
        # Simple rule: Max EMI should be 50% of monthly income
        monthly_income = income / 12
        max_allowed_emi = (monthly_income * 0.5) - existing_emis
        
        # Approximate EMI at 8% for 20 years
        r = 8 / (12 * 100)
        n = 20 * 12
        estimated_emi = (loan_amount * r * (1 + r)**n) / ((1 + r)**n - 1)
        
        is_eligible = estimated_emi <= max_allowed_emi
        
        return Response({
            "is_eligible": is_eligible,
            "max_allowed_emi": round(max_allowed_emi, 2),
            "estimated_emi": round(estimated_emi, 2),
            "recommendation": "Eligible" if is_eligible else "Required income is lower than debt-to-income ratio limits."
        })


@api_view(["POST"])
def loan_prediction(request):

    age = request.data.get("age")
    income = request.data.get("income")
    credit_score = request.data.get("credit_score")
    loan_amount = request.data.get("loan_amount")
    loan_term = request.data.get("loan_term")
    employment_status = request.data.get("employment_status")

    result = predict_loan(
        int(age),
        float(income),
        int(credit_score),
        float(loan_amount),
        int(loan_term),
        employment_status,
    )

    if result == 1:
        prediction = "Loan Approved"
    else:
        prediction = "Loan Rejected"

    return Response({"prediction": prediction})