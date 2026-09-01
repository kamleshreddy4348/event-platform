from rest_framework import serializers

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    event_title = serializers.ReadOnlyField(source='event.title')

    class Meta:
        model = Notification
        fields = ['id', 'event', 'event_title', 'notification_type', 'message', 'read', 'created_at']
        read_only_fields = ['event', 'notification_type', 'message', 'created_at']
