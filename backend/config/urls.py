from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def api_root(request):
    return JsonResponse({"message": "Welcome to SmartProperty API"})

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", api_root),

    path("api/auth/", include("accounts.urls")),
    path("api/properties/", include("properties.urls")),
    path("api/transactions/", include("transactions.urls")),
    path("api/loans/", include("loans.urls")),
    path("api/chat/", include("chat.urls")),
]