import apiClient from './client';

export function listEvents(filters = {}) {
  return apiClient.get('/events/', { params: filters }).then((res) => res.data);
}

export function getEvent(id) {
  return apiClient.get(`/events/${id}/`).then((res) => res.data);
}

export function createEvent(data) {
  return apiClient.post('/events/', data).then((res) => res.data);
}

export function updateEvent(id, data) {
  return apiClient.put(`/events/${id}/`, data).then((res) => res.data);
}

export function deleteEvent(id) {
  return apiClient.delete(`/events/${id}/`);
}

export function rsvpToEvent(id, status = 'GOING') {
  return apiClient.post(`/events/${id}/rsvp/`, { status }).then((res) => res.data);
}

export function cancelRsvp(id) {
  return apiClient.delete(`/events/${id}/rsvp/`);
}

export function getGuestList(id) {
  return apiClient.get(`/events/${id}/guest_list/`).then((res) => res.data);
}
