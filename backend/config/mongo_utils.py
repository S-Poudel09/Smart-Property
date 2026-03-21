"""
MongoDB utility functions for logging activities and fetching analytics.
These are safe to call even if MongoDB is not connected — they fail silently.
"""
from django.utils import timezone


def log_activity(user_email: str, action: str, details: dict = None, ip_address: str = None, status: str = 'success'):
    """Log a user activity to MongoDB. Fails silently if MongoDB is unavailable."""
    try:
        from config.mongo_models import ActivityLog
        ActivityLog(
            user_email=user_email,
            action=action,
            details=details or {},
            ip_address=ip_address or '',
            status=status,
            timestamp=timezone.now(),
        ).save()
    except Exception as e:
        print(f"[MongoDB] Activity log failed: {e}")


def log_property_view(property_id: str, viewer_email: str = None):
    """Track a property view in MongoDB."""
    try:
        from config.mongo_models import PropertyView
        PropertyView(
            property_id=str(property_id),
            viewer_email=viewer_email or 'anonymous',
            viewed_at=timezone.now(),
        ).save()
    except Exception as e:
        print(f"[MongoDB] Property view log failed: {e}")


def save_analytics_snapshot(snapshot_data: dict):
    """Save a daily analytics snapshot to MongoDB."""
    try:
        from config.mongo_models import AnalyticsSnapshot
        today = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
        AnalyticsSnapshot.objects(date=today).update_one(
            set__total_users=snapshot_data.get('total_users', 0),
            set__total_properties=snapshot_data.get('total_properties', 0),
            set__total_transactions=snapshot_data.get('total_transactions', 0),
            set__total_revenue=snapshot_data.get('total_revenue', 0),
            set__new_users_today=snapshot_data.get('new_users_today', 0),
            set__active_fraud_alerts=snapshot_data.get('active_fraud_alerts', 0),
            upsert=True,
        )
    except Exception as e:
        print(f"[MongoDB] Analytics snapshot failed: {e}")


def get_recent_activity(limit: int = 20):
    """Get recent activity logs from MongoDB."""
    try:
        from config.mongo_models import ActivityLog
        logs = ActivityLog.objects.order_by('-timestamp').limit(limit)
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
    """Get the view count for a specific property."""
    try:
        from config.mongo_models import PropertyView
        return PropertyView.objects(property_id=str(property_id)).count()
    except Exception:
        return 0
