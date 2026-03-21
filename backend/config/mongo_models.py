"""
MongoDB Document Models for Analytics & Activity Logging.
These are MongoEngine documents stored in the 'smart_property' MongoDB database.
They supplement (not replace) the primary Django/SQLite models.
"""
import mongoengine as me
from django.utils import timezone


class ActivityLog(me.Document):
    """Logs user actions for analytics and audit trails."""
    user_email = me.StringField(required=True)
    action = me.StringField(required=True, choices=[
        'login', 'logout', 'register',
        'view_property', 'search_property', 'create_property',
        'update_property', 'delete_property',
        'create_transaction', 'upload_proof', 'verify_proof',
        'apply_loan', 'approve_loan', 'reject_loan',
        'send_message', 'verify_kyc', 'reject_kyc',
    ])
    status = me.StringField(default='success', choices=['success', 'failure', 'pending'])
    details = me.DictField()
    ip_address = me.StringField()
    timestamp = me.DateTimeField(default=timezone.now)

    meta = {
        'collection': 'activity_logs',
        'ordering': ['-timestamp'],
        'indexes': ['user_email', 'action', 'timestamp'],
    }


class AnalyticsSnapshot(me.Document):
    """Periodic snapshots of platform metrics for trend analysis."""
    date = me.DateTimeField(required=True, unique=True)
    total_users = me.IntField(default=0)
    total_properties = me.IntField(default=0)
    total_transactions = me.IntField(default=0)
    total_revenue = me.FloatField(default=0.0)
    new_users_today = me.IntField(default=0)
    active_fraud_alerts = me.IntField(default=0)

    meta = {
        'collection': 'analytics_snapshots',
        'ordering': ['-date'],
    }


class PropertyView(me.Document):
    """Tracks property view counts for recommendations."""
    property_id = me.StringField(required=True)
    viewer_email = me.StringField()
    viewed_at = me.DateTimeField(default=timezone.now)

    meta = {
        'collection': 'property_views',
        'indexes': ['property_id', 'viewer_email'],
    }
