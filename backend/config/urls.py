from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.views.generic import RedirectView

from django.conf import settings
from django.conf.urls.static import static

def api_root(request):
    return JsonResponse({"message": "Welcome to SmartProperty API"})

from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
from .analytics_views import SystemAnalyticsView, FraudDetectionView, ActivityLogsView
from accounts.views import UserCountView

from two_factor.urls import urlpatterns as tf_urls

urlpatterns = [
    path("", api_root, name="api-root"),
    path("", include(tf_urls)),
    path("admin/", admin.site.urls),
    path("favicon.ico", RedirectView.as_view(url="/static/favicon.ico")),

    path("api/auth/", include("accounts.urls")),
    path("api/users/count/", UserCountView.as_view(), name='root-user-count'),
    path("api/properties/", include("properties.urls")),
    path("api/transactions/", include("transactions.urls")),
    path("api/loans/", include("loans.urls")),
    path("api/chat/", include("chat.urls")),
    path("api/services/", include("services.urls")),
    path("api/notifications/", include("notifications.urls")),

    # Admin Intelligence
    path("api/admin/analytics/", SystemAnalyticsView.as_view(), name="system-analytics"),
    path("api/admin/fraud/", FraudDetectionView.as_view(), name="fraud-alerts"),
    path("api/admin/activity_logs/", ActivityLogsView.as_view(), name="activity-logs"),
    path("api/admin/activity_logs/<str:log_id>/", ActivityLogsView.as_view(), name="activity-logs-detail"),

    # API Documentation
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)