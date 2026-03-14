from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.role == 'admin')

class IsSellerUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.role == 'seller')

class IsBuyerUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.role == 'buyer')
