import django_filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets

from .models import Event
from .permissions import IsOrganizerOrReadOnly
from .serializers import EventSerializer


class EventFilter(django_filters.FilterSet):
    date_after = django_filters.DateTimeFilter(field_name='date', lookup_expr='gte')
    date_before = django_filters.DateTimeFilter(field_name='date', lookup_expr='lte')
    location = django_filters.CharFilter(field_name='location', lookup_expr='icontains')

    class Meta:
        model = Event
        fields = ['location', 'date_after', 'date_before']


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [IsOrganizerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = EventFilter
    search_fields = ['title', 'description', 'location']
    ordering_fields = ['date', 'created_at', 'title']

    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user)
