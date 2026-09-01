from rest_framework import serializers

from .models import Event


class EventSerializer(serializers.ModelSerializer):
    organizer_username = serializers.ReadOnlyField(source='organizer.username')
    rsvp_count = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'date', 'location', 'capacity',
            'organizer', 'organizer_username', 'rsvp_count', 'created_at', 'updated_at',
        ]
        read_only_fields = ['organizer']

    def get_rsvp_count(self, obj):
        return obj.rsvps.filter(status='going').count()
