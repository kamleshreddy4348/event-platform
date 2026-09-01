from rest_framework import serializers

from .models import RSVP


class RSVPSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    event_title = serializers.ReadOnlyField(source='event.title')

    class Meta:
        model = RSVP
        fields = ['id', 'event', 'event_title', 'user', 'username', 'status', 'created_at', 'updated_at']
        read_only_fields = ['user']
