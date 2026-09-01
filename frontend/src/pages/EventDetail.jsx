import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import Button from '../components/Button'

const STATUS_STYLES = {
  going: 'bg-[var(--success)] text-white',
  maybe: 'bg-[var(--warn-soft)] text-[var(--warn)]',
  not_going: 'bg-[var(--danger-soft)] text-[var(--danger)]',
}

export default function EventDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [myRsvp, setMyRsvp] = useState(null)
  const [loading, setLoading] = useState(true)
  const [rsvpLoading, setRsvpLoading] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    Promise.all([
      client.get(`/events/${id}/`),
      client.get('/rsvps/', { params: { event: id } }),
    ])
      .then(([eventRes, rsvpRes]) => {
        setEvent(eventRes.data)
        const list = rsvpRes.data.results ?? rsvpRes.data
        setMyRsvp(list.find((r) => r.username === user?.username) || null)
      })
      .catch(() => setError('Event not found.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id])

  const setRsvp = async (status) => {
    setRsvpLoading(true)
    try {
      if (myRsvp) {
        const res = await client.patch(`/rsvps/${myRsvp.id}/`, { status })
        setMyRsvp(res.data)
      } else {
        const res = await client.post('/rsvps/', { event: Number(id), status })
        setMyRsvp(res.data)
      }
      load()
    } finally {
      setRsvpLoading(false)
    }
  }

  const deleteEvent = async () => {
    if (!confirm('Delete this event? This cannot be undone.')) return
    await client.delete(`/events/${id}/`)
    navigate('/events')
  }

  if (loading) return <Layout title="Loading…"><p className="text-[var(--text-muted)]">Loading…</p></Layout>
  if (error) return <Layout title="Not found"><p className="text-[var(--danger)]">{error}</p></Layout>

  const d = new Date(event.date)
  const isOrganizer = user && user.username === event.organizer_username

  return (
    <Layout title={event.title} subtitle={`Hosted by ${event.organizer_username}`}>
      <Link to="/events" className="text-sm text-[var(--text-muted)] hover:text-[var(--primary)]">← Back to events</Link>

      <div className="card mt-4 overflow-hidden">
        <div className="auth-illustration flex h-32 items-center justify-center text-4xl text-white">🎫</div>
        <div className="p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h1 className="font-display text-3xl font-bold text-[var(--text-primary)]">{event.title}</h1>
            {myRsvp && (
              <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[myRsvp.status]}`}>
                You're {myRsvp.status.replace('_', ' ')}
              </span>
            )}
          </div>
          <p className="mt-3 whitespace-pre-line text-[var(--text-muted)]">{event.description}</p>

          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-[var(--surface-border)] pt-6 sm:grid-cols-4">
            <div>
              <p className="text-xs uppercase text-[var(--text-faint)]">Date</p>
              <p className="text-sm font-medium">{d.toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-[var(--text-faint)]">Time</p>
              <p className="text-sm font-medium">{d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-[var(--text-faint)]">Location</p>
              <p className="text-sm font-medium">{event.location}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-[var(--text-faint)]">Going</p>
              <p className="text-sm font-medium">{event.rsvp_count} / {event.capacity}</p>
            </div>
          </div>

          {!isOrganizer && (
            <div className="mt-8 flex flex-wrap gap-3">
              {['going', 'maybe', 'not_going'].map((status) => (
                <button
                  key={status}
                  disabled={rsvpLoading}
                  onClick={() => setRsvp(status)}
                  className={`rounded-full px-5 py-2 text-sm font-semibold capitalize transition-all disabled:opacity-50 ${
                    myRsvp?.status === status ? STATUS_STYLES[status] : 'border border-[var(--surface-border)] text-[var(--text-muted)] hover:border-[var(--primary)]'
                  }`}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
          )}

          {isOrganizer && (
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={`/events/${id}/edit`}><Button variant="ghost">Edit event</Button></Link>
              <Link to={`/events/${id}/guests`}><Button variant="soft">Manage guest list</Button></Link>
              <Button variant="danger" onClick={deleteEvent}>Delete</Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
