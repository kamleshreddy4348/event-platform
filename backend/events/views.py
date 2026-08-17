from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import RSVP, Event
from .permissions import IsAdminOrReadOnly
from .serializers import EventSerializer, RSVPSerializer


class EventViewSet(viewsets.ModelViewSet):
    """
    Handles all the standard event operations:
      GET    /api/events/          list all events (with optional filters)
      POST   /api/events/          create an event (Admin only)
      GET    /api/events/{id}/     view one event
      PUT    /api/events/{id}/     update an event (Admin only)
      DELETE /api/events/{id}/     delete an event (Admin only)

    Plus two extra actions bolted on below:
      POST   /api/events/{id}/rsvp/          RSVP to this event
      DELETE /api/events/{id}/rsvp/          cancel your RSVP
      GET    /api/events/{id}/guest_list/    see who's RSVP'd (Admin only)
    """

    queryset = Event.objects.all()
    serializer_class = EventSerializer

    def get_permissions(self):
        # The admin-only restriction should apply to create/update/delete
        # of the event itself, but NOT to actions like rsvp — any logged-in
        # attendee needs to be able to RSVP.
        if self.action in ["rsvp"]:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated(), IsAdminOrReadOnly()]

    def get_serializer_context(self):
        # Passes the current request into the serializer, so
        # get_my_rsvp_status() above can check who's asking.
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def get_queryset(self):
        queryset = super().get_queryset()

        # Simple filtering via query params, e.g.:
        #   /api/events/?location=Chicago
        #   /api/events/?date_from=2026-09-01
        #   /api/events/?upcoming=true
        location = self.request.query_params.get("location")
        if location:
            queryset = queryset.filter(location__icontains=location)

        date_from = self.request.query_params.get("date_from")
        if date_from:
            queryset = queryset.filter(date__gte=date_from)

        date_to = self.request.query_params.get("date_to")
        if date_to:
            queryset = queryset.filter(date__lte=date_to)

        if self.request.query_params.get("upcoming") == "true":
            queryset = queryset.filter(date__gte=timezone.localdate())

        return queryset

    @action(detail=True, methods=["post", "delete"])
    def rsvp(self, request, pk=None):
        event = self.get_object()

        if request.method == "DELETE":
            RSVP.objects.filter(event=event, user=request.user).delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

        # POST: create or update this user's RSVP for this event.
        status_value = request.data.get("status", RSVP.Status.GOING)
        rsvp_obj, _created = RSVP.objects.update_or_create(
            event=event,
            user=request.user,
            defaults={"status": status_value},
        )
        return Response(RSVPSerializer(rsvp_obj).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def guest_list(self, request, pk=None):
        event = self.get_object()

        if request.user.role != "ADMIN":
            return Response(
                {"detail": "Only admins can view the guest list."},
                status=status.HTTP_403_FORBIDDEN,
            )

        rsvps = event.rsvps.select_related("user").all()
        return Response(RSVPSerializer(rsvps, many=True).data)
