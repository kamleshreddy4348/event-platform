from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from events.models import Event

from .models import Guest
from .serializers import EventWithGuestsSerializer, GuestSerializer


class IsEventOrganizer(permissions.BasePermission):
    """Only the event's organizer can manage its guest list."""

    def has_object_permission(self, request, view, obj):
        return obj.event.organizer_id == request.user.id


class GuestViewSet(viewsets.ModelViewSet):
    serializer_class = GuestSerializer
    permission_classes = [permissions.IsAuthenticated, IsEventOrganizer]

    def get_queryset(self):
        qs = Guest.objects.select_related('event', 'invited_by').filter(
            event__organizer=self.request.user
        )
        event_id = self.request.query_params.get('event')
        if event_id:
            qs = qs.filter(event_id=event_id)
        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param)
        return qs

    def perform_create(self, serializer):
        serializer.save(invited_by=self.request.user)

    @action(detail=False, methods=['get'], url_path='by-event/(?P<event_id>[^/.]+)')
    def by_event(self, request, event_id=None):
        """Return an event with its full guest list nested (guest list view)."""
        event = Event.objects.filter(id=event_id, organizer=request.user).first()
        if not event:
            return Response({'detail': 'Not found.'}, status=404)
        return Response(EventWithGuestsSerializer(event).data)
