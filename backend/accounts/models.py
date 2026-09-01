from django.conf import settings
from django.db import models


class Profile(models.Model):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('attendee', 'Attendee'),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, related_name='profile', on_delete=models.CASCADE
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='attendee')

    def __str__(self):
        return f'{self.user.username} ({self.role})'
