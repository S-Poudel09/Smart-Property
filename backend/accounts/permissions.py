"""
Custom permission classes for the accounts module.

This file defines reusable Django REST Framework permission classes for
role-based access control. These permissions help restrict API endpoints
based on the authenticated user's assigned role.

Permissions included:
- IsAdminUser: Allows access to admin users and superusers.
- IsSellerUser: Allows access only to seller users.
- IsBuyerUser: Allows access only to buyer users.
"""
from rest_framework import permissions
# Grants access only to administrative users.
class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and (getattr(request.user, 'role', '').lower() == 'admin' or request.user.is_superuser))

# Grants access only to users assigned the seller role.
class IsSellerUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and getattr(request.user, 'role', '').lower() == 'seller')

# Grants access only to users assigned the buyer role.
class IsBuyerUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and getattr(request.user, 'role', '').lower() == 'buyer')
