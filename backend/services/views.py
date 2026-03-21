from rest_framework import viewsets, permissions
from .models import Service, ServiceBooking
from .serializers import ServiceSerializer, ServiceBookingSerializer

class ServiceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Service.objects.filter(is_active=True)
    serializer_class = ServiceSerializer
    permission_classes = [permissions.AllowAny]

class ServiceBookingViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceBookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ServiceBooking.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
