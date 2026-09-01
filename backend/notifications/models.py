from django.conf import settings
from django.db import models

from events.models import Event


class Notification(models.Model):
    TYPE_CHOICES = [
        ('reminder', 'Event Reminder'),
        ('rsvp_update', 'RSVP Update'),
        ('guest_update', 'Guest List Update'),
    ]

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name='notifications', on_delete=models.CASCADE
    )
    event = models.ForeignKey(Event, related_name='notifications', on_delete=models.CASCADE, null=True, blank=True)
    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='reminder')
    message = models.CharField(max_length=255)
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        # Prevent duplicate reminders for the same user/event pair.
        unique_together = ('recipient', 'event', 'notification_type')

    def __str__(self):
        return f'{self.recipient} — {self.message}'
