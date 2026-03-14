from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Property
from .serializers import PropertySerializer
from accounts.permissions import IsSellerUser, IsAdminUser

class PropertyViewSet(viewsets.ModelViewSet):
    """
    Standard ViewSet for Property CRUD.
    """
    queryset = Property.objects.all()
    serializer_class = PropertySerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.AllowAny]
        elif self.action == 'create':
            permission_classes = [permissions.IsAuthenticated, IsSellerUser]
        else:
            # For update/delete, we check ownership in the view
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def get_queryset(self):
        queryset = Property.objects.all()
        if self.action == 'list':
            # Usually users see only published properties
            return queryset.filter(status="PUBLISHED")
        return queryset

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.owner != request.user and request.user.role != 'admin':
            return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.owner != request.user and request.user.role != 'admin':
            return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsSellerUser])
    def submit(self, request, pk=None):
        property_obj = self.get_object()
        if property_obj.owner != request.user:
            return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        property_obj.status = "SUBMITTED"
        property_obj.save()
        return Response({"message": "Property submitted for approval"})

    # ADMIN ACTIONS
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsAdminUser])
    def approve(self, request, pk=None):
        property_obj = self.get_object()
        property_obj.status = "PUBLISHED"
        property_obj.is_verified = True
        property_obj.save()
        return Response({"message": "Property approved and published"})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsAdminUser])
    def reject(self, request, pk=None):
        property_obj = self.get_object()
        reason = request.data.get("rejection_reason", "No reason provided")
        property_obj.status = "REJECTED"
        property_obj.rejection_reason = reason
        property_obj.save()
        return Response({"message": "Property rejected", "reason": reason})
