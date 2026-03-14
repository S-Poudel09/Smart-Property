from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Loan
from .serializers import LoanSerializer
from ml.predict_loan import predict_loan


class LoanViewSet(viewsets.ModelViewSet):
    queryset = Loan.objects.all()
    serializer_class = LoanSerializer


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