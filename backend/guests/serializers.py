from rest_framework import serializers

from events.models import Event
from events.serializers import EventSerializer

from .models import Guest


class GuestSerializer(serializers.ModelSerializer):
    invited_by_username = serializers.ReadOnlyField(source='invited_by.username')

    class Meta:
        model = Guest
        fields = [
            'id', 'event', 'name', 'email', 'invited_by', 'invited_by_username',
            'status', 'plus_ones', 'notes', 'created_at', 'updated_at',
        ]
        read_only_fields = ['invited_by']


class EventWithGuestsSerializer(EventSerializer):
    """Nested serializer: an event with its full guest list embedded."""
    guests = GuestSerializer(many=True, read_only=True)

    class Meta(EventSerializer.Meta):
        fields = EventSerializer.Meta.fields + ['guests']
