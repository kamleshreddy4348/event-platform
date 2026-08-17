import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listEvents, rsvpToEvent, cancelRsvp } from '../api/events';
import './Events.css';

export default function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter state
  const [location, setLocation] = useState('');
  const [upcomingOnly, setUpcomingOnly] = useState(true);

  async function loadEvents() {
    setIsLoading(true);
    setError('');
    try {
      const filters = {};
      if (location.trim()) filters.location = location.trim();
      if (upcomingOnly) filters.upcoming = 'true';
      const data = await listEvents(filters);
      setEvents(data);
    } catch (err) {
      setError('Could not load events. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFilterSubmit(e) {
    e.preventDefault();
    loadEvents();
  }

  async function handleRsvpToggle(event) {
    try {
      if (event.my_rsvp_status === 'GOING') {
        await cancelRsvp(event.id);
      } else {
        await rsvpToEvent(event.id, 'GOING');
      }
      loadEvents();
    } catch {
      setError('Something went wrong updating your RSVP.');
    }
  }

  return (
    <div className="events-page">
      <div className="events-page__header">
        <div>
          <h1>Events</h1>
          <p className="events-page__subtitle">Browse upcoming events and RSVP.</p>
        </div>
        {user?.role === 'ADMIN' && (
          <Link to="/events/new" className="events-page__new-btn">
            + New event
          </Link>
        )}
      </div>

      <form className="events-filters" onSubmit={handleFilterSubmit}>
        <input
          type="text"
          placeholder="Filter by location…"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <label className="events-filters__checkbox">
          <input
            type="checkbox"
            checked={upcomingOnly}
            onChange={(e) => setUpcomingOnly(e.target.checked)}
          />
          Upcoming only
        </label>
        <button type="submit">Apply</button>
      </form>

      {error && <div className="events-page__error">{error}</div>}

      {isLoading ? (
        <p className="events-page__loading">Loading events…</p>
      ) : events.length === 0 ? (
        <p className="events-page__empty">
          No events found. {user?.role === 'ADMIN' ? 'Create the first one above.' : 'Check back soon.'}
        </p>
      ) : (
        <div className="events-list">
          {events.map((event) => (
            <div key={event.id} className="event-card">
              <div className="event-card__main">
                <Link to={`/events/${event.id}`} className="event-card__title">
                  {event.title}
                </Link>
                <div className="event-card__meta">
                  {event.date} at {event.time.slice(0, 5)} · {event.location}
                </div>
                <div className="event-card__going">{event.going_count} going</div>
              </div>
              <button
                className={
                  'event-card__rsvp' +
                  (event.my_rsvp_status === 'GOING' ? ' is-going' : '')
                }
                onClick={() => handleRsvpToggle(event)}
              >
                {event.my_rsvp_status === 'GOING' ? "You're going ✓" : 'RSVP'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
