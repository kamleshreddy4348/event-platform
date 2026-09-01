import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import Button from '../components/Button'

function StatCard({ icon, label, value, hint, iconBg }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[var(--text-muted)]">{label}</p>
          <p className="mt-1 font-display text-3xl font-bold text-[var(--text-primary)]">{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${iconBg}`}>{icon}</div>
      </div>
      {hint && <p className="mt-3 text-xs font-medium text-[var(--success)]">{hint}</p>}
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [rsvps, setRsvps] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([client.get('/events/'), client.get('/rsvps/')])
      .then(([eventsRes, rsvpRes]) => {
        setEvents(eventsRes.data.results ?? eventsRes.data)
        setRsvps(rsvpRes.data.results ?? rsvpRes.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const now = new Date()
  const upcoming = events.filter((e) => new Date(e.date) >= now).sort((a, b) => new Date(a.date) - new Date(b.date))
  const hosting = events.filter((e) => e.organizer_username === user?.username)
  const totalGuestsGoing = events.reduce((sum, e) => sum + (e.rsvp_count || 0), 0)
  const myRsvpsGoing = rsvps.filter((r) => r.status === 'going').length

  return (
    <Layout title={`Welcome back, ${user?.username || 'there'}!`} subtitle="Here's what's happening with your events.">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon="📅" iconBg="bg-[var(--primary-soft)]" label="Total Events" value={loading ? '—' : events.length} hint={`${hosting.length} hosted by you`} />
        <StatCard icon="⏰" iconBg="bg-[var(--info-soft)]" label="Upcoming Events" value={loading ? '—' : upcoming.length} hint="Sorted by soonest" />
        <StatCard icon="👥" iconBg="bg-[var(--success-soft)]" label="Total Guests Going" value={loading ? '—' : totalGuestsGoing} hint="Across all events" />
        <StatCard icon="🎟️" iconBg="bg-[var(--warn-soft)]" label="Your RSVPs" value={loading ? '—' : myRsvpsGoing} hint="Marked as going" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="card p-6 xl:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Upcoming Events</h2>
            <Link to="/events" className="text-sm font-medium text-[var(--primary)] hover:underline">View All</Link>
          </div>
          <div className="mt-4 divide-y divide-[var(--surface-border)]">
            {loading && <p className="py-6 text-sm text-[var(--text-muted)]">Loading…</p>}
            {!loading && upcoming.length === 0 && (
              <p className="py-6 text-sm text-[var(--text-muted)]">No upcoming events yet. <Link to="/events/new" className="text-[var(--primary)] hover:underline">Host one →</Link></p>
            )}
            {upcoming.slice(0, 5).map((event) => {
              const d = new Date(event.date)
              return (
                <Link key={event.id} to={`/events/${event.id}`} className="flex items-center justify-between gap-4 py-3.5 hover:opacity-80">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary-dark)]">
                      <span className="text-[10px] font-bold leading-none">{d.toLocaleDateString([], { month: 'short' }).toUpperCase()}</span>
                      <span className="text-sm font-bold leading-none">{d.getDate()}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{event.title}</p>
                      <p className="truncate text-xs text-[var(--text-muted)]">{d.toLocaleDateString()} · {event.location}</p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-[var(--info-soft)] px-3 py-1 text-xs font-semibold text-[var(--info)]">Upcoming</span>
                </Link>
              )
            })}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-display text-lg font-semibold">Quick Actions</h2>
          <div className="mt-4 flex flex-col gap-3">
            {user?.role === 'admin' && (
              <Link to="/events/new"><Button className="w-full">+ Host an event</Button></Link>
            )}
            <Link to="/events"><Button variant="ghost" className="w-full">Browse all events</Button></Link>
            {hosting.length > 0 && (
              <Link to={`/events/${hosting[0].id}/guests`}><Button variant="soft" className="w-full">Manage guest list</Button></Link>
            )}
          </div>

          {hosting.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">You're hosting</h3>
              <div className="mt-3 space-y-2">
                {hosting.slice(0, 4).map((e) => (
                  <Link key={e.id} to={`/events/${e.id}`} className="block truncate rounded-lg bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--primary-soft)]">
                    {e.title}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
