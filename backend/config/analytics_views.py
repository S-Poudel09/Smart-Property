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
            (getattr(request.user, 'role', '').lower() == 'admin' or request.user.is_superuser)
        )


class SystemAnalyticsView(APIView):
    permission_classes = [IsRoleAdmin]

    def get(self, request):
        try:
            # Primary SQL Stats
            total_users = User.objects.count()
            total_properties = Property.objects.count()
            total_transactions = Transaction.objects.count()
            
            # Revenue from transactions
            total_revenue = Transaction.objects.filter(status='COMPLETED').aggregate(Sum('total_amount'))['total_amount__sum'] or 0
            
            # Growth (last 30 days)
            last_month = timezone.now() - timedelta(days=30)
            new_users_month = User.objects.filter(date_joined__gte=last_month).count()
            user_growth = (new_users_month / total_users * 100) if total_users > 0 else 0
            
            # Try to fetch historical data from PostgreSQL snapshot if available
            from analytics.utils import get_analytics_snapshot
            snapshot = get_analytics_snapshot()
            
            # Chart Data (Past 7 days) - Daily Transaction Count
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
                'revenue': float(total_revenue),
                'userGrowth': round(user_growth, 1),
                'transactionData': chart_data,
                'snapshot': snapshot # Live snapshot from PostgreSQL
            })
        except Exception as e:
            return Response({"error": f"Analytics engine failure: {str(e)}"}, status=500)

class FraudDetectionView(APIView):
    permission_classes = [IsRoleAdmin]

    def get(self, request):
        try:
            alerts = []

            # 1. Dark-web card transactions
            dark_web_txns = Transaction.objects.filter(card_on_dark_web=True).select_related('buyer', 'property')[:20]
            for txn in dark_web_txns:
                alerts.append({
                    'id': f"dark-web-{txn.id}",
                    'category': 'CYBER_THREAT',
                    'type': 'Compromised Credit Card',
                    'user': txn.buyer.email,
                    'target': txn.property.title if txn.property else 'Unknown',
                    'risk_score': 95,
                    'severity': 'CRITICAL',
                    'timestamp': txn.created_at.isoformat() if txn.created_at else timezone.now().isoformat(),
                    'description': f"Imperial Defense detected a {txn.card_brand} {txn.card_type} card associated with this transaction on the dark web."
                })

            # 2. Duplicate property titles (potential listing fraud)
            duplicates = Property.objects.values('title').annotate(title_count=Count('id')).filter(title_count__gt=2)
            for dup in duplicates:
                alerts.append({
                    'id': f"dup-{hash(dup['title'])}",
                    'category': 'LISTING_INTEGRITY',
                    'type': 'Suspected Multi-Listing Fraud',
                    'target': dup['title'],
                    'risk_score': 65,
                    'severity': 'MEDIUM',
                    'timestamp': timezone.now().isoformat(),
                    'description': f"System found {dup['title_count']} properties with identical titles. Potential spam or duplicate listing activity."
                })

            # 3. Abnormal transaction amounts (> 10M Rs)
            # Adjusting threshold to 10M for broader detection
            abnormal = Transaction.objects.filter(total_amount__gt=10000000).select_related('buyer', 'property')[:15]
            for trans in abnormal:
                alerts.append({
                    'id': f"abnormal-{trans.id}",
                    'category': 'FINANCIAL_ANOMALY',
                    'type': 'High Value Asset Transfer',
                    'user': trans.buyer.email,
                    'target': trans.property.title if trans.property else 'Unknown',
                    'amount': f"Rs {trans.total_amount}",
                    'risk_score': 75,
                    'severity': 'HIGH',
                    'timestamp': trans.created_at.isoformat() if trans.created_at else timezone.now().isoformat(),
                    'description': f"High-magnitude transaction detected. Manual treasury verification recommended."
                })

            # Sort by risk score descending
            alerts.sort(key=lambda x: x['risk_score'], reverse=True)
            return Response(alerts)
        except Exception as e:
            return Response({"error": f"Fraud detection engine failure: {str(e)}"}, status=500)


class ActivityLogsView(APIView):
    permission_classes = [IsRoleAdmin]

    def get(self, request):
        from analytics.utils import get_recent_activity
        limit = int(request.query_params.get('limit', 50))
        logs = get_recent_activity(limit=limit)
        return Response(logs)

    def post(self, request):
        from analytics.utils import log_activity
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
            from analytics.models import ActivityLog
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
            from analytics.models import ActivityLog
            log = ActivityLog.objects.get(id=log_id)
            log.delete()
            return Response({"message": "Log deleted successfully"})
        except Exception as e:
            return Response({"error": str(e)}, status=404)
