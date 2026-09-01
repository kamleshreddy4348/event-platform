import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'
import Layout from '../components/Layout'
import Button from '../components/Button'
import { useNotifications } from '../context/NotificationsContext'

const TYPE_ICON = {
  reminder: '⏰',
  rsvp_update: '🎟️',
  guest_update: '👥',
}

export default function Notifications() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const { refresh } = useNotifications()

  const load = () => {
    setLoading(true)
    client.get('/notifications/')
      .then((res) => setItems(res.data.results ?? res.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const markAllRead = async () => {
    await client.post('/notifications/mark-all-read/')
    load()
    refresh()
  }

  const markRead = async (id) => {
    await client.patch(`/notifications/${id}/`, { read: true })
    load()
    refresh()
  }

  return (
    <Layout title="Notifications" subtitle="Reminders and updates about your events.">
      <div className="flex items-center justify-end">
        <Button variant="ghost" onClick={markAllRead}>Mark all as read</Button>
      </div>

      <div className="card mt-4 divide-y divide-[var(--surface-border)]">
        {loading && <p className="p-8 text-center text-[var(--text-muted)]">Loading…</p>}
        {!loading && items.length === 0 && (
          <p className="p-8 text-center text-[var(--text-muted)]">No notifications yet.</p>
        )}
        {items.map((n) => (
          <div
            key={n.id}
            onClick={() => !n.read && markRead(n.id)}
            className={`flex cursor-pointer items-start gap-3 p-4 transition-colors ${n.read ? '' : 'bg-[var(--primary-soft)]/40'}`}
          >
            <span className="text-lg">{TYPE_ICON[n.notification_type] || '🔔'}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-[var(--text-primary)]">{n.message}</p>
              <div className="mt-1 flex items-center gap-2 text-xs text-[var(--text-faint)]">
                <span>{new Date(n.created_at).toLocaleString()}</span>
                {n.event && (
                  <>
                    <span>·</span>
                    <Link to={`/events/${n.event}`} className="text-[var(--primary)] hover:underline" onClick={(e) => e.stopPropagation()}>
                      View event
                    </Link>
                  </>
                )}
              </div>
            </div>
            {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--primary)]" />}
          </div>
        ))}
      </div>
    </Layout>
  )
}
