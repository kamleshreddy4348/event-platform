from django.conf import settings
from django.db import models


class Event(models.Model):
    """
    A single event: something an Admin creates, and Attendees can browse
    and RSVP to.
    """

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    date = models.DateField()
    time = models.TimeField()
    location = models.CharField(max_length=255)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="events_created",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["date", "time"]

    def __str__(self):
        return f"{self.title} ({self.date})"


class RSVP(models.Model):
    """
    Tracks that a specific user is registered for a specific event.
    One user can only RSVP once per event (see unique_together below) —
    RSVP-ing again just updates their existing RSVP instead of duplicating it.
    """

    class Status(models.TextChoices):
        GOING = "GOING", "Going"
        NOT_GOING = "NOT_GOING", "Not going"

    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="rsvps")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="rsvps",
    )
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.GOING
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("event", "user")

    def __str__(self):
        return f"{self.user} -> {self.event} ({self.status})"
