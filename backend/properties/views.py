from django.db import models
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.core.mail import send_mail
from .models import Property, PropertyDocument
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
        property_obj = serializer.save(owner=self.request.user)
        # MongoDB activity log
        try:
            from config.mongo_utils import log_activity
            log_activity(self.request.user.email, 'create_property', details={'property_id': str(property_obj.id)}, status='success')
        except Exception:
            pass

    def get_queryset(self):
        queryset = Property.objects.all()
        user = self.request.user
        
        if self.action == 'list':
            if user.is_authenticated:
                if user.role == 'admin':
                    return queryset
                # Sellers see their own + published
                return queryset.filter(models.Q(status="PUBLISHED") | models.Q(owner=user))
            return queryset.filter(status="PUBLISHED")
        return queryset

    def update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
        except Exception:
            return Response({"error": "Imperial artifact not found"}, status=status.HTTP_404_NOT_FOUND)
            
        if instance.owner != request.user and request.user.role != 'admin':
            return Response({"error": "Forbidden: Sovereign access denied"}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
        except Exception:
            return Response({"error": "Imperial artifact not found"}, status=status.HTTP_404_NOT_FOUND)
            
        if instance.owner != request.user and request.user.role != 'admin':
            return Response({"error": "Forbidden: Sovereign access denied"}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsSellerUser])
    def submit(self, request, pk=None):
        try:
            property_obj = self.get_object()
        except Exception:
            return Response({"error": "Imperial artifact not found"}, status=status.HTTP_404_NOT_FOUND)
            
        if property_obj.owner != request.user:
            return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        property_obj.status = "SUBMITTED"
        property_obj.save()
        
        # MongoDB activity log
        try:
            from config.mongo_utils import log_activity
            log_activity(request.user.email, 'submit_property', details={'property_id': str(property_obj.id)}, status='success')
        except Exception:
            pass

        return Response({"message": "Property submitted for approval"})

    # ADMIN ACTIONS
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsAdminUser])
    def approve(self, request, pk=None):
        property_obj = self.get_object()
        property_obj.status = "PUBLISHED"
        property_obj.is_verified = True
        property_obj.save()

        # Notify owner via email
        try:
            send_mail(
                subject="Your property has been approved!",
                message=f"Hi {property_obj.owner.full_name},\n\nYour listing \"{property_obj.title}\" has been approved and is now live on SmartProperty.\n\n— SmartProperty Team",
                from_email=None,
                recipient_list=[property_obj.owner.email],
                fail_silently=True,
            )
        except Exception:
            pass

        # Create in-app notification
        try:
            from notifications.models import Notification
            Notification.objects.create(
                user=property_obj.owner,
                type='property_approved',
                title='Property Approved',
                message=f'Your listing "{property_obj.title}" is now live.',
                link=f'/properties/{property_obj.id}',
            )
        except Exception:
            pass

        return Response({"message": "Property approved and published"})
        
        # MongoDB activity log
        try:
            from config.mongo_utils import log_activity
            log_activity(request.user.email, 'approve_property', details={'property_id': str(property_obj.id)}, status='success')
        except Exception:
            pass

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsAdminUser])
    def reject(self, request, pk=None):
        property_obj = self.get_object()
        reason = request.data.get("rejection_reason", "No reason provided")
        property_obj.status = "REJECTED"
        property_obj.rejection_reason = reason
        property_obj.save()

        # Notify owner via email
        try:
            send_mail(
                subject="Property listing update",
                message=f"Hi {property_obj.owner.full_name},\n\nYour listing \"{property_obj.title}\" was not approved.\n\nReason: {reason}\n\nPlease update and resubmit.\n\n— SmartProperty Team",
                from_email=None,
                recipient_list=[property_obj.owner.email],
                fail_silently=True,
            )
        except Exception:
            pass

        # Create in-app notification
        try:
            from notifications.models import Notification
            Notification.objects.create(
                user=property_obj.owner,
                type='property_rejected',
                title='Property Rejected',
                message=f'Your listing "{property_obj.title}" was not approved. Reason: {reason}',
                link='/dashboard/seller/listings',
            )
        except Exception:
            pass

        return Response({"message": "Property rejected", "reason": reason})

    @action(detail=True, methods=['post'], url_path='verify-document/(?P<doc_id>[^/.]+)', permission_classes=[permissions.IsAuthenticated, IsSellerUser])
    def ocr_verify(self, request, pk=None, doc_id=None):
        """
        Simulate OCR verification for a specific document.
        """
        try:
            doc = PropertyDocument.objects.get(id=doc_id, property_id=pk)
            if doc.property.owner != request.user and request.user.role != 'admin':
                return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
            
            # Simulate OCR logic
            import time
            # time.sleep(1) # Simulating processing delay
            
            doc.is_verified = True
            doc.ocr_data = {
                "document_number": "DOC-123456",
                "extracted_name": doc.property.owner.full_name,
                "confidence_score": 0.98,
                "issue_date": "2023-01-01",
                "property_address_match": True
            }
            doc.save()
            
            return Response({
                "message": "OCR verification completed",
                "is_verified": doc.is_verified,
                "ocr_data": doc.ocr_data
            })
        except PropertyDocument.DoesNotExist:
            return Response({"error": "Document not found"}, status=status.HTTP_404_NOT_FOUND)
