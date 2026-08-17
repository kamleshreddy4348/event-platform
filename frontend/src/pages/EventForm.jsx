import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEvent } from '../api/events';
import './EventForm.css';

export default function EventForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const event = await createEvent(form);
      navigate(`/events/${event.id}`);
    } catch (err) {
      const data = err.response?.data;
      const firstError = data && Object.values(data)[0];
      const message = Array.isArray(firstError) ? firstError[0] : firstError;
      setError(message || 'Something went wrong creating the event.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="event-form-page">
      <h1>Create an event</h1>

      <form className="event-form" onSubmit={handleSubmit}>
        {error && <div className="event-form__error">{error}</div>}

        <label className="event-form__field">
          <span>Title</span>
          <input name="title" value={form.title} onChange={handleChange} required />
        </label>

        <label className="event-form__field">
          <span>Description</span>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
          />
        </label>

        <div className="event-form__row">
          <label className="event-form__field">
            <span>Date</span>
            <input
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              required
            />
          </label>

          <label className="event-form__field">
            <span>Time</span>
            <input
              name="time"
              type="time"
              value={form.time}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <label className="event-form__field">
          <span>Location</span>
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            required
          />
        </label>

        <button className="event-form__submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating…' : 'Create event'}
        </button>
      </form>
    </div>
  );
}
