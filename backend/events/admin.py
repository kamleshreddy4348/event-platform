from django.contrib import admin

from .models import RSVP, Event


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ["title", "date", "time", "location", "created_by"]
    list_filter = ["date"]


@admin.register(RSVP)
class RSVPAdmin(admin.ModelAdmin):
    list_display = ["event", "user", "status", "created_at"]
    list_filter = ["status"]
