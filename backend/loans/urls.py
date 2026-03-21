from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LoanViewSet, loan_prediction

router = DefaultRouter(trailing_slash=True)
router.register(r'', LoanViewSet, basename='loan')

urlpatterns = [
    path('predict', loan_prediction, name='loan-predict'),
]

urlpatterns += router.urls