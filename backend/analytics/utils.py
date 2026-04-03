import logging
from django.utils import timezone

logger = logging.getLogger(__name__)

def log_activity(user_email: str, action: str, details: dict = None, ip_address: str = None, status: str = 'success'):
    try:
        from analytics.models import ActivityLog
        ActivityLog.objects.create(
            user_email=user_email,
            action=action,
            details=details or {},
            ip_address=ip_address,
            status=status,
            timestamp=timezone.now(),
        )
    except Exception as e:
        logger.error(f"Activity log failed: {e}")

def log_property_view(property_id: str, viewer_email: str = None):
    try:
        from analytics.models import PropertyView
        PropertyView.objects.create(
            property_id=str(property_id),
            viewer_email=viewer_email or 'anonymous',
            viewed_at=timezone.now(),
        )
    except Exception as e:
        logger.error(f"Property view log failed: {e}")

def save_analytics_snapshot(snapshot_data: dict):
    try:
        from analytics.models import AnalyticsSnapshot
        today = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
        AnalyticsSnapshot.objects.update_or_create(
            date=today,
            defaults={
                'total_users': snapshot_data.get('total_users', 0),
                'total_properties': snapshot_data.get('total_properties', 0),
                'total_transactions': snapshot_data.get('total_transactions', 0),
                'total_revenue': snapshot_data.get('total_revenue', 0),
                'new_users_today': snapshot_data.get('new_users_today', 0),
                'active_fraud_alerts': snapshot_data.get('active_fraud_alerts', 0),
            }
        )
    except Exception as e:
        logger.error(f"Analytics snapshot failed: {e}")

def get_analytics_snapshot(date=None):
    try:
        from analytics.models import AnalyticsSnapshot
        if date is None:
            date = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
        
        snapshot = AnalyticsSnapshot.objects.filter(date=date).first()
        if snapshot:
            return {
                'total_users': snapshot.total_users,
                'total_properties': snapshot.total_properties,
                'total_transactions': snapshot.total_transactions,
                'total_revenue': snapshot.total_revenue,
                'new_users_today': snapshot.new_users_today,
                'active_fraud_alerts': snapshot.active_fraud_alerts,
                'date': snapshot.date.isoformat()
            }
    except Exception as e:
        logger.error(f"Fetch snapshot failed: {e}")
    return None

def get_recent_activity(limit: int = 20):
    try:
        from analytics.models import ActivityLog
        logs = ActivityLog.objects.order_by('-timestamp')[:limit]
        return [
            {
                'user': log.user_email,
                'action': log.action,
                'status': log.status,
                'details': log.details,
                'timestamp': log.timestamp.isoformat(),
                'id': str(log.id)
            }
            for log in logs
        ]
    except Exception:
        return []

def get_property_view_count(property_id: str) -> int:
    try:
        from analytics.models import PropertyView
        return PropertyView.objects.filter(property_id=str(property_id)).count()
    except Exception:
        return 0
