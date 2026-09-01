from rest_framework import permissions, viewsets

from notifications.models import Notification

from .models import RSVP
from .serializers import RSVPSerializer


class IsOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.user_id == request.user.id


class RSVPViewSet(viewsets.ModelViewSet):
    serializer_class = RSVPSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        user = self.request.user
        qs = RSVP.objects.select_related('event', 'user')
        event_id = self.request.query_params.get('event')
        if event_id:
            qs = qs.filter(event_id=event_id)
            # The event's organizer can see every RSVP for their event;
            # everyone else only sees their own.
            if not qs.filter(event__organizer=user).exists():
                qs = qs.filter(user=user)
            return qs
        return qs.filter(user=user)

    def perform_create(self, serializer):
        rsvp = serializer.save(user=self.request.user)
        if rsvp.status == 'going' and rsvp.event.organizer_id != self.request.user.id:
            Notification.objects.update_or_create(
                recipient=rsvp.event.organizer,
                event=rsvp.event,
                notification_type='rsvp_update',
                defaults={'message': f'{self.request.user.username} RSVP\'d going to "{rsvp.event.title}".'},
            )
