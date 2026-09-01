import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import client from '../api/client'
import FormField from '../components/FormField'
import Input from '../components/Input'
import Button from '../components/Button'
import Layout from '../components/Layout'

const STATUS_COLORS = {
  invited: 'text-[var(--text-muted)] border-[var(--surface-border)]',
  confirmed: 'text-[var(--success)] border-[var(--success)]',
  declined: 'text-[var(--danger)] border-[var(--danger)]',
  attended: 'text-[var(--info)] border-[var(--info)]',
}

export default function GuestList() {
  const { id } = useParams()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', plus_ones: 0 })
  const [adding, setAdding] = useState(false)

  const load = () => {
    setLoading(true)
    client.get(`/guests/by-event/${id}/`)
      .then((res) => setEvent(res.data))
      .catch(() => setError('You can only view the guest list for events you organize.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id])

  const addGuest = async (e) => {
    e.preventDefault()
    setAdding(true)
    try {
      await client.post('/guests/', { ...form, event: Number(id) })
      setForm({ name: '', email: '', plus_ones: 0 })
      load()
    } finally {
      setAdding(false)
    }
  }

  const updateStatus = async (guestId, status) => {
    await client.patch(`/guests/${guestId}/`, { status })
    load()
  }

  const removeGuest = async (guestId) => {
    if (!confirm('Remove this guest?')) return
    await client.delete(`/guests/${guestId}/`)
    load()
  }

  if (loading) return <Layout title="Loading…"><p className="text-[var(--text-muted)]">Loading…</p></Layout>
  if (error) return <Layout title="Guest list"><p className="text-[var(--danger)]">{error}</p></Layout>

  const guests = event.guests || []
  const confirmed = guests.filter((g) => g.status === 'confirmed' || g.status === 'attended').length

  return (
    <Layout title={`Guest list — ${event.title}`} subtitle={`${confirmed} confirmed of ${guests.length} invited · capacity ${event.capacity}`}>
      <Link to={`/events/${id}`} className="text-sm text-[var(--text-muted)] hover:text-[var(--primary)]">← Back to event</Link>

      <form onSubmit={addGuest} className="card mt-4 grid grid-cols-1 gap-3 p-5 sm:grid-cols-[2fr_2fr_1fr_auto]">
        <FormField label="Name">
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Carol Rao" required />
        </FormField>
        <FormField label="Email">
          <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="carol@example.com" required />
        </FormField>
        <FormField label="+1s">
          <Input type="number" min="0" value={form.plus_ones} onChange={(e) => setForm({ ...form, plus_ones: e.target.value })} />
        </FormField>
        <div className="flex items-end">
          <Button type="submit" disabled={adding} className="w-full">{adding ? 'Adding…' : 'Invite'}</Button>
        </div>
      </form>

      <div className="card mt-6 divide-y divide-[var(--surface-border)] overflow-hidden">
        {guests.length === 0 && (
          <p className="p-8 text-center text-[var(--text-muted)]">No guests invited yet — add your first one above.</p>
        )}
        {guests.map((g) => (
          <div key={g.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-medium text-[var(--text-primary)]">{g.name} {g.plus_ones > 0 && <span className="text-xs text-[var(--text-faint)]">+{g.plus_ones}</span>}</p>
              <p className="text-xs text-[var(--text-faint)]">{g.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={g.status}
                onChange={(e) => updateStatus(g.id, e.target.value)}
                className={`rounded-full border bg-transparent px-3 py-1 text-xs font-semibold capitalize outline-none ${STATUS_COLORS[g.status]}`}
              >
                {['invited', 'confirmed', 'declined', 'attended'].map((s) => (
                  <option key={s} value={s} className="bg-[var(--surface)] text-[var(--text-primary)]">{s}</option>
                ))}
              </select>
              <button onClick={() => removeGuest(g.id)} className="text-xs text-[var(--text-faint)] hover:text-[var(--danger)]">Remove</button>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  )
}
