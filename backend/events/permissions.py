from rest_framework import permissions


def user_role(user):
    profile = getattr(user, 'profile', None)
    return profile.role if profile else 'attendee'


class IsOrganizerOrReadOnly(permissions.BasePermission):
    """
    Any authenticated user can read (browse/RSVP to) events.
    Only Admin-role users can create events.
    Once created, only that event's organizer can edit/delete it.
    """

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.method == 'POST':
            return user_role(request.user) == 'admin'
        return True

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.organizer_id == request.user.id
