from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and (getattr(request.user, 'role', '').lower() == 'admin' or request.user.is_superuser))

class IsSellerUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and getattr(request.user, 'role', '').lower() == 'seller')

class IsBuyerUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and getattr(request.user, 'role', '').lower() == 'buyer')
