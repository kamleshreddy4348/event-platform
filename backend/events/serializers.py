from rest_framework import serializers

from .models import RSVP, Event


class EventSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source="created_by.username", read_only=True)
    going_count = serializers.SerializerMethodField()
    my_rsvp_status = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            "id",
            "title",
            "description",
            "date",
            "time",
            "location",
            "created_by",
            "created_by_username",
            "created_at",
            "going_count",
            "my_rsvp_status",
        ]
        read_only_fields = ["created_by"]

    def get_going_count(self, obj):
        return obj.rsvps.filter(status=RSVP.Status.GOING).count()

    def get_my_rsvp_status(self, obj):
        # Lets the frontend show "You're going" vs a "RSVP" button, without
        # a second API call. Returns None if the logged-in user hasn't
        # RSVP'd to this event at all.
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return None
        rsvp = obj.rsvps.filter(user=request.user).first()
        return rsvp.status if rsvp else None


class RSVPSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = RSVP
        fields = ["id", "event", "user", "username", "status", "created_at"]
        read_only_fields = ["user"]
