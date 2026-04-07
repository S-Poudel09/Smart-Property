from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServiceViewSet, ServiceBookingViewSet

router = DefaultRouter(trailing_slash=True)
router.register(r'bookings', ServiceBookingViewSet, basename='servicebooking')
router.register(r'', ServiceViewSet, basename='service')

urlpatterns = [
    path('', include(router.urls)),
]
