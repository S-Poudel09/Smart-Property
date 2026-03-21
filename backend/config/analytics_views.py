from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Count, Sum
from accounts.models import User
from properties.models import Property
from transactions.models import Transaction
from services.models import ServiceBooking
from django.utils import timezone
from datetime import timedelta


class IsRoleAdmin(permissions.BasePermission):
    """Allow access to users whose role is 'admin'."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            getattr(request.user, 'role', '') == 'admin'
        )


class SystemAnalyticsView(APIView):
    permission_classes = [IsRoleAdmin]

    def get(self, request):
        # Basic Stats
        total_users = User.objects.count()
        total_properties = Property.objects.count()
        total_transactions = Transaction.objects.count()
        
        # Revenue from transactions (assuming verification means money moved)
        total_revenue = Transaction.objects.filter(status='COMPLETED').aggregate(Sum('total_amount'))['total_amount__sum'] or 0
        
        # Growth (last 30 days)
        last_month = timezone.now() - timedelta(days=30)
        new_users = User.objects.filter(date_joined__gte=last_month).count()
        user_growth = (new_users / total_users * 100) if total_users > 0 else 0
        
        # Chart Data (Past 7 days)
        chart_data = []
        for i in range(6, -1, -1):
            date = timezone.now() - timedelta(days=i)
            count = Transaction.objects.filter(created_at__date=date.date()).count()
            chart_data.append({
                'name': date.strftime('%a'),
                'amount': count
            })

        return Response({
            'totalUsers': total_users,
            'totalProperties': total_properties,
            'totalTransactions': total_transactions,
            'revenue': total_revenue,
            'userGrowth': round(user_growth, 1),
            'transactionData': chart_data
        })

class FraudDetectionView(APIView):
    permission_classes = [IsRoleAdmin]

    def get(self, request):
        alerts = []

        # 1. Dark-web card transactions (from CSV data)
        dark_web_txns = Transaction.objects.filter(card_on_dark_web=True).select_related('buyer', 'property')[:20]
        for txn in dark_web_txns:
            alerts.append({
                'id': f"dark-web-{txn.id}",
                'type': 'Card Compromised',
                'user': str(txn.buyer),
                'property': txn.property.title if txn.property else 'Unknown',
                'risk': 'High',
                'date': txn.created_at.strftime('%b %d, %Y') if txn.created_at else 'Recent',
                'description': f"Transaction via {txn.card_brand} {txn.card_type} card found on dark web."
            })

        # 2. Duplicate property titles (potential spam)
        duplicates = Property.objects.values('title').annotate(title_count=Count('id')).filter(title_count__gt=1)
        for dup in duplicates:
            alerts.append({
                'id': f"dup-{dup['title'][:20]}",
                'type': 'Duplicate Listing',
                'property': dup['title'],
                'risk': 'Medium',
                'date': 'Active',
                'description': f"{dup['title_count']} listings with the same title."
            })

        # 3. Abnormal transaction amounts (> 100M)
        abnormal = Transaction.objects.filter(total_amount__gt=100000000).select_related('buyer')[:10]
        for trans in abnormal:
            alerts.append({
                'id': f"trans-{trans.id}",
                'type': 'Abnormal Transaction',
                'user': str(trans.buyer),
                'amount': f"Rs {trans.total_amount}",
                'risk': 'Medium',
                'date': 'Recent'
            })

        return Response(alerts)


class ActivityLogsView(APIView):
    permission_classes = [IsRoleAdmin]

    def get(self, request):
        from config.mongo_utils import get_recent_activity
        limit = int(request.query_params.get('limit', 50))
        logs = get_recent_activity(limit=limit)
        return Response(logs)

    def post(self, request):
        from config.mongo_utils import log_activity
        user_email = request.data.get('user_email')
        action = request.data.get('action')
        status = request.data.get('status', 'success')
        details = request.data.get('details', {})
        
        if not user_email or not action:
            return Response({"error": "user_email and action are required"}, status=400)
            
        log_activity(user_email, action, details, status=status)
        return Response({"message": "Log created successfully"}, status=201)

    def put(self, request, log_id=None):
        if not log_id:
            return Response({"error": "log_id is required"}, status=400)
        
        try:
            from config.mongo_models import ActivityLog
            log = ActivityLog.objects.get(id=log_id)
            log.action = request.data.get('action', log.action)
            log.status = request.data.get('status', log.status)
            log.details = request.data.get('details', log.details)
            log.save()
            return Response({"message": "Log updated successfully"})
        except Exception as e:
            return Response({"error": str(e)}, status=404)

    def delete(self, request, log_id=None):
        if not log_id:
            return Response({"error": "log_id is required"}, status=400)
            
        try:
            from config.mongo_models import ActivityLog
            log = ActivityLog.objects.get(id=log_id)
            log.delete()
            return Response({"message": "Log deleted successfully"})
        except Exception as e:
            return Response({"error": str(e)}, status=404)
