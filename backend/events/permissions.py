from rest_framework import permissions


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Anyone logged in can view (GET) events.
    Only users with role=ADMIN can create, update, or delete them.
    """

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:  # GET, HEAD, OPTIONS
            return True
        return bool(request.user and request.user.role == "ADMIN")
