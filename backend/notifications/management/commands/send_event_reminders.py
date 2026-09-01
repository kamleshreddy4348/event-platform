"""
Sends a reminder notification (and email) to every user RSVP'd 'going' to an
event starting within the next REMINDER_WINDOW_HOURS.

Intended to run on a schedule (cron, Celery beat, etc). Example crontab entry
to run every hour:

    0 * * * * cd /path/to/backend && venv/bin/python manage.py send_event_reminders

Safe to run repeatedly — each (recipient, event) pair only ever gets one
'reminder' notification, enforced by a unique constraint on the model.
"""
from django.conf import settings
from django.core.mail import send_mail
from django.core.management.base import BaseCommand
from django.db import IntegrityError
from django.utils import timezone

from notifications.models import Notification
from rsvps.models import RSVP


class Command(BaseCommand):
    help = 'Send reminder notifications for events starting within the reminder window.'

    def handle(self, *args, **options):
        window_hours = getattr(settings, 'REMINDER_WINDOW_HOURS', 24)
        now = timezone.now()
        window_end = now + timezone.timedelta(hours=window_hours)

        going = RSVP.objects.filter(
            status='going',
            event__date__gte=now,
            event__date__lte=window_end,
        ).select_related('event', 'user')

        sent = 0
        skipped = 0
        for rsvp in going:
            event = rsvp.event
            message = f'Reminder: "{event.title}" starts {event.date.strftime("%b %d at %I:%M %p")} at {event.location}.'
            try:
                Notification.objects.create(
                    recipient=rsvp.user,
                    event=event,
                    notification_type='reminder',
                    message=message,
                )
            except IntegrityError:
                # Already reminded this user about this event.
                skipped += 1
                continue

            if rsvp.user.email:
                send_mail(
                    subject=f'Reminder: {event.title}',
                    message=message,
                    from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@eventhub.local'),
                    recipient_list=[rsvp.user.email],
                    fail_silently=True,
                )
            sent += 1

        self.stdout.write(self.style.SUCCESS(
            f'Sent {sent} reminder(s), skipped {skipped} already-sent.'
        ))
