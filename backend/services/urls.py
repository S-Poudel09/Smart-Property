from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServiceBookingViewSet

router = DefaultRouter(trailing_slash=True)
router.register(r'bookings', ServiceBookingViewSet, basename='servicebooking')

urlpatterns = [
    path('', include(router.urls)),
]
