import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'
import EventCard from '../components/EventCard'
import Input from '../components/Input'
import Layout from '../components/Layout'

export default function EventList() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')

  useEffect(() => {
    const params = {}
    if (search) params.search = search
    if (location) params.location = location
    setLoading(true)
    client.get('/events/', { params })
      .then((res) => setEvents(res.data.results ?? res.data))
      .finally(() => setLoading(false))
  }, [search, location])

  return (
    <Layout title="Events" subtitle="Discover, RSVP, and manage your events.">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
          <Input placeholder="Search events…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Input placeholder="Filter by location…" value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
        {isAdmin && (
          <Link to="/events/new" className="shrink-0 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-center text-sm font-semibold text-white hover:bg-[var(--primary-dark)]">
            + Host an event
          </Link>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {loading && <p className="text-[var(--text-muted)]">Loading events…</p>}
        {!loading && events.length === 0 && (
          <div className="col-span-full card p-10 text-center text-[var(--text-muted)]">
            No events match yet.{isAdmin && <> Be the first to <Link to="/events/new" className="text-[var(--primary)] hover:underline">host one</Link>.</>}
          </div>
        )}
        {events.map((event) => <EventCard key={event.id} event={event} />)}
      </div>
    </Layout>
  )
}
