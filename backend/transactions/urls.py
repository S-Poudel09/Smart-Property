from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TransactionViewSet

router = DefaultRouter(trailing_slash=True)
router.register(r'', TransactionViewSet, basename='transaction')

urlpatterns = [
    path('', include(router.urls)),
]
