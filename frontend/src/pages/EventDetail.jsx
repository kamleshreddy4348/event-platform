import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getEvent,
  rsvpToEvent,
  cancelRsvp,
  getGuestList,
  deleteEvent,
} from '../api/events';
import './EventDetail.css';

export default function EventDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [guestList, setGuestList] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  async function load() {
    setIsLoading(true);
    try {
      const data = await getEvent(id);
      setEvent(data);

      if (user?.role === 'ADMIN') {
        const guests = await getGuestList(id);
        setGuestList(guests);
      }
    } catch {
      setError('Could not load this event.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleRsvpToggle() {
    try {
      if (event.my_rsvp_status === 'GOING') {
        await cancelRsvp(event.id);
      } else {
        await rsvpToEvent(event.id, 'GOING');
      }
      load();
    } catch {
      setError('Something went wrong updating your RSVP.');
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${event.title}"? This can't be undone.`)) return;
    try {
      await deleteEvent(event.id);
      navigate('/events');
    } catch {
      setError('Could not delete this event.');
    }
  }

  if (isLoading) return <p>Loading…</p>;
  if (error) return <p className="event-detail__error">{error}</p>;
  if (!event) return null;

  return (
    <div className="event-detail">
      <Link to="/events" className="event-detail__back">
        ← Back to events
      </Link>

      <div className="event-detail__header">
        <h1>{event.title}</h1>
        {user?.role === 'ADMIN' && (
          <button className="event-detail__delete" onClick={handleDelete}>
            Delete event
          </button>
        )}
      </div>

      <div className="event-detail__meta">
        <span>{event.date}</span>
        <span>·</span>
        <span>{event.time.slice(0, 5)}</span>
        <span>·</span>
        <span>{event.location}</span>
      </div>

      {event.description && (
        <p className="event-detail__description">{event.description}</p>
      )}

      <div className="event-detail__rsvp-row">
        <span className="event-detail__going-count">
          {event.going_count} {event.going_count === 1 ? 'person' : 'people'} going
        </span>
        <button
          className={
            'event-detail__rsvp-btn' +
            (event.my_rsvp_status === 'GOING' ? ' is-going' : '')
          }
          onClick={handleRsvpToggle}
        >
          {event.my_rsvp_status === 'GOING' ? "You're going ✓" : 'RSVP to this event'}
        </button>
      </div>

      {user?.role === 'ADMIN' && guestList && (
        <div className="event-detail__guests">
          <h2>Guest list</h2>
          {guestList.length === 0 ? (
            <p className="event-detail__no-guests">No one has RSVP'd yet.</p>
          ) : (
            <ul>
              {guestList.map((rsvp) => (
                <li key={rsvp.id}>
                  <span>{rsvp.username}</span>
                  <span className="event-detail__guest-status">{rsvp.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
