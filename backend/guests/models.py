from django.conf import settings
from django.db import models

from events.models import Event


class Guest(models.Model):
    STATUS_CHOICES = [
        ('invited', 'Invited'),
        ('confirmed', 'Confirmed'),
        ('declined', 'Declined'),
        ('attended', 'Attended'),
    ]

    event = models.ForeignKey(Event, related_name='guests', on_delete=models.CASCADE)
    name = models.CharField(max_length=150)
    email = models.EmailField()
    invited_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name='invited_guests', on_delete=models.CASCADE
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='invited')
    plus_ones = models.PositiveSmallIntegerField(default=0)
    notes = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        unique_together = ('event', 'email')

    def __str__(self):
        return f'{self.name} <{self.email}> — {self.event}'
