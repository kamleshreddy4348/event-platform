from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    """
    Our own User model, based on Django's built-in one, with one addition:
    a `role` field so we can tell Admins apart from Attendees.

    Everything else (username, email, password, etc.) comes for free from
    AbstractUser.
    """

    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        ATTENDEE = "ATTENDEE", "Attendee"

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.ATTENDEE,
    )

    def __str__(self):
        return f"{self.username} ({self.role})"
