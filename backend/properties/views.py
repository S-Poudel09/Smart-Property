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
    ViewSet responsible for managing property-related CRUD operations.

    This class handles:
    - Public property listing and retrieval
    - Seller property creation and submission
    - Admin approval and rejection of listings
    - Property price prediction
    - OCR-based document verification
    - Property review submission
    """
    queryset = Property.objects.all()
    serializer_class = PropertySerializer

    def get_permissions(self):
        """
        Assign permissions dynamically based on the current action.

        Rules:
        - list/retrieve: public access
        - create: authenticated seller only
        - update/delete/other actions: authenticated users only
        """
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.AllowAny]
        elif self.action == 'create':
            permission_classes = [permissions.IsAuthenticated, IsSellerUser]
        else:
            # For update/delete, we check ownership in the view
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def create(self, request, *args, **kwargs):
        """
        Create a new property record.

        Validates serializer input first. If valid, delegates saving
        to perform_create(). Returns proper success or error responses.
        """
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except Exception as e:
            return Response({"error": "Failed to create property"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def perform_create(self, serializer):
        # Only sellers can create properties and submit them with 'submitted' status
        if self.request.user.role != 'seller':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only sellers can submit properties.")
        
        # Save property with the authenticated seller as owner
        # and set its initial review status as 'submitted'
        property_obj = serializer.save(owner=self.request.user, status='submitted')
        
        # Notify admins about the new property submission
        try:
            from accounts.models import User
            from notifications.models import Notification
            admins = User.objects.filter(role='admin')
            for admin in admins:
                Notification.objects.create(
                    user=admin,
                    type='property_submission',
                    title='New Property Submission',
                    message=f'Seller {self.request.user.full_name} submitted "{property_obj.title}" for review.',
                    link='/dashboard/admin/properties'
                )
        except Exception:
            # Notification failure should not block property creation
            pass

        # PostgreSQL activity log
        # Notify admins about the new property submission
        from analytics.utils import log_activity
        log_activity(
            self.request.user.email, 
            'create_property', 
            details={'property_id': str(property_obj.id), 'title': property_obj.title}, 
            status='success'
        )

    # Record the activity in the analytics/audit log
    def get_queryset(self):
        """
        Return properties based on the requesting user's role and visibility rules,
        with support for searching and filtering.

        Visibility rules:
        - Admin: can see all properties
        - Authenticated users:
            - if seller=me query param is provided, only own properties
            - otherwise own properties + published properties
        - Anonymous users: only published properties
        """
        queryset = Property.objects.all().order_by('-created_at')
        user = self.request.user
        
        # Query parameter used for seller dashboard filtering
        is_seller_me = self.request.query_params.get('seller') == 'me'
        
        # Apply visibility rules universally
        if user.is_authenticated and user.role == 'admin':
            pass # Admins see all
        elif user.is_authenticated:
            if is_seller_me:
                queryset = queryset.filter(owner=user)
            else:
                # Authenticated users can see their own properties
                # plus all publicly published listings
                queryset = queryset.filter(models.Q(status__iexact="published") | models.Q(owner=user))
        else:
            # Unauthenticated users can only access published listings
            queryset = queryset.filter(status__iexact="published")

        # --- TACTICAL FILTER MATRIX ---
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                models.Q(title__icontains=search) | 
                models.Q(location__icontains=search) |
                models.Q(description__icontains=search)
            )

        min_price = self.request.query_params.get('min_price')
        if min_price:
            queryset = queryset.filter(price__gte=min_price)

        max_price = self.request.query_params.get('max_price')
        if max_price:
            queryset = queryset.filter(price__lte=max_price)

        property_type = self.request.query_params.get('type')
        if property_type and property_type != 'all':
            queryset = queryset.filter(property_type__iexact=property_type)

        category = self.request.query_params.get('category')
        if category and category != 'all':
            queryset = queryset.filter(category__iexact=category)

        return queryset

    def retrieve(self, request, *args, **kwargs):
        """
        Retrieve a single property and log the view activity.
        """
        instance = self.get_object()
        # Log property view for analytics
        from analytics.utils import log_property_view
        log_property_view(
            property_id=str(instance.id),
            viewer_email=request.user.email if request.user.is_authenticated else 'anonymous'
        )
        return super().retrieve(request, *args, **kwargs)

    def perform_update(self, serializer):
        """
        Update an existing property.

        Business rule:
        - Non-admin users cannot manually change property status
          to protected states such as 'approved' or 'published'
        """
        user = self.request.user
        
        # If the user is trying to change status to protected states without being admin
        if user.role != 'admin' and 'status' in serializer.validated_data:
            target_status = serializer.validated_data['status']
            if target_status in ['approved', 'published']:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("Only admins can approve/publish properties.")
        
        serializer.save()

    def update(self, request, *args, **kwargs):
        """
        Update a property only if the requester is:
        - the property owner, or
        - an admin
        """
        try:
            instance = self.get_object()
        except Exception:
            return Response({"error": "Imperial artifact not found"}, status=status.HTTP_404_NOT_FOUND)
            
        if instance.owner != request.user and request.user.role != 'admin':
            return Response({"error": "Forbidden: Sovereign access denied"}, status=status.HTTP_403_FORBIDDEN)
        
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        """
        Partially update a property (PATCH) with ownership validation.
        """
        try:
            instance = self.get_object()
        except Exception:
            return Response({"error": "Imperial artifact not found"}, status=status.HTTP_404_NOT_FOUND)
        
        if instance.owner != request.user and request.user.role != 'admin':
            return Response({"error": "Forbidden: Sovereign access denied"}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        """
        Delete a property only if the requester is:
        - the property owner, or
        - an admin
        """
        try:
            instance = self.get_object()
        except Exception:
            return Response({"error": "Imperial artifact not found"}, status=status.HTTP_404_NOT_FOUND)
            
        if instance.status in ['approved', 'published'] and request.user.role != 'admin':
            return Response({"error": "Forbidden: Only admins can delete approved or published properties"}, status=status.HTTP_403_FORBIDDEN)

        if instance.owner != request.user and request.user.role != 'admin':
            return Response({"error": "Forbidden: Sovereign access denied"}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsSellerUser])
    def submit(self, request, pk=None):
        """
        Submit an existing seller-owned property for admin approval.

        This changes the property status to 'submitted',
        notifies admins, and logs the submission event.
        """
        try:
            property_obj = self.get_object()
        except Exception:
            return Response({"error": "Imperial artifact not found"}, status=status.HTTP_404_NOT_FOUND)
            
        if property_obj.owner != request.user:
            return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        property_obj.status = "submitted"
        property_obj.save()
        
        # Notify admins about the submission
        from accounts.models import User
        from notifications.models import Notification
        admins = User.objects.filter(role='admin')
        for admin in admins:
            Notification.objects.create(
                user=admin,
                type='property_submission',
                title='New Property Submission',
                message=f'Seller {request.user.full_name} submitted "{property_obj.title}" for review.',
                link='/dashboard/admin/properties'
            )

         # Log submission activity
        from analytics.utils import log_activity
        log_activity(request.user.email, 'submit_property', details={'property_id': str(property_obj.id)}, status='success')

        return Response({"message": "Property submitted for approval"})

    # ADMIN ACTIONS
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsAdminUser])
    def approve(self, request, pk=None):
        property_obj = self.get_object()
        property_obj.status = "published"
        property_obj.is_verified = True
        property_obj.save()

        # PostgreSQL activity log
        from analytics.utils import log_activity
        log_activity(request.user.email, 'approve_property', details={'property_id': str(property_obj.id)}, status='success')

        return Response({"message": "Property approved and published"})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsAdminUser])
    def reject(self, request, pk=None):
        """
        Admin action to reject a property submission.

        Stores the rejection reason, sends an email to the owner,
        and creates an in-app notification.
        """
        property_obj = self.get_object()
        reason = request.data.get("rejection_reason", "No reason provided")
        property_obj.status = "rejected"
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

    @action(detail=True, methods=['post'], url_path='predict-price', permission_classes=[permissions.IsAuthenticated])
    def predict_price(self, request, pk=None):
        """
        Predict an estimated price for the selected property.

        Uses rule-based logic from the custom PropertyPricePredictor class.
        The request body may override some feature values for simulation.
        """
        from .ml_utils import PropertyPricePredictor
        try:
            property_obj = self.get_object()
        except Exception:
            return Response({"error": "Property node not found"}, status=status.HTTP_404_NOT_FOUND)
            
        # Extract features for prediction
        data = {
            'area_sqft': property_obj.area_sqft or 0,
            'bedrooms': property_obj.beds or 1,
            'bathrooms': property_obj.baths or 1,
            'property_type': property_obj.property_type,
            'location': property_obj.location,
            'stories': property_obj.stories or 1,
            'mainroad': property_obj.mainroad,
            'airconditioning': property_obj.airconditioning,
            'parking_spaces': property_obj.parking_spaces or 0
        }
        
        # Override with request data if provided (user can play with variables)
        if request.data:
            data.update(request.data)
            
        predicted_price = PropertyPricePredictor.predict(data)
        
        return Response({
            "status": "success",
            "prediction": {
                "estimated_price": predicted_price,
                "confidence": 0.85, # Rule-based confidence
                "model_type": "SmartProperty-V1-RuleBased",
                "features_analyzed": list(data.keys()),
                "market_trend": "stable"
            },
            "system_audit": "Automated valuation based on registry historical weights."
        })

    @action(detail=True, methods=['post'], url_path='verify-document/(?P<doc_id>[^/.]+)', permission_classes=[permissions.IsAuthenticated, IsSellerUser])
    def ocr_verify(self, request, pk=None, doc_id=None):
        """
        Simulate OCR-based verification for a property document.

        This method verifies ownership, marks the document as verified,
        and stores mock OCR metadata in the document record.
        """
        try:
            doc = PropertyDocument.objects.get(id=doc_id, property_id=pk)
            if doc.property.owner != request.user and request.user.role != 'admin':
                return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
            
            # Simulate OCR logic
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

    @action(detail=True, methods=['post'], url_path='add-review', permission_classes=[permissions.IsAuthenticated])
    def add_review(self, request, pk=None):
        """
        Add or update a review for a property.

        Features:
        - Requires comment
        - Validates rating range (1 to 5)
        - Marks review as verified purchase if user completed a transaction
        """
        from .models import Review
        # Importing ReviewSerializer locally to avoid circulars if any
        from .serializers import ReviewSerializer
        from transactions.models import Transaction

        property_obj = self.get_object()
        user = request.user
        
        rating = request.data.get('rating', 5)
        comment = request.data.get('comment', '')
        
        if not comment:
            return Response({"error": "Comment required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            rating = int(rating)
            if not (1 <= rating <= 5): raise ValueError()
        except ValueError:
            return Response({"error": "Rating must be between 1 and 5"}, status=400)
            
        # Check if verified purchase
        is_verified = Transaction.objects.filter(
            property=property_obj, 
            buyer=user, 
            status='COMPLETED'
        ).exists()
        
        review, created = Review.objects.update_or_create(
            property=property_obj,
            user=user,
            defaults={
                'rating': rating,
                'comment': comment,
                'is_verified_purchase': is_verified
            }
        )
        
        return Response({
            "message": "Review synchronized",
            "review": ReviewSerializer(review).data
        })
