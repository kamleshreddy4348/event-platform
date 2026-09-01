import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import client from '../api/client'
import FormField from '../components/FormField'
import Input from '../components/Input'
import Button from '../components/Button'
import Layout from '../components/Layout'

function toLocalInputValue(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function EventForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', description: '', date: '', location: '', capacity: 100 })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isEdit) return
    client.get(`/events/${id}/`).then((res) => {
      setForm({ ...res.data, date: toLocalInputValue(res.data.date) })
    })
  }, [id])

  const submit = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    const payload = { ...form, date: new Date(form.date).toISOString() }
    try {
      if (isEdit) {
        await client.patch(`/events/${id}/`, payload)
        navigate(`/events/${id}`)
      } else {
        const res = await client.post('/events/', payload)
        navigate(`/events/${res.data.id}`)
      }
    } catch (err) {
      setErrors(err.response?.data || { detail: 'Something went wrong.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout title={isEdit ? 'Edit event' : 'Host an event'} subtitle="Your guests will see this as their ticket.">
      <div className="card mx-auto max-w-2xl p-8">
        <form onSubmit={submit} className="space-y-5">
          <FormField label="Title" error={errors.title?.[0]}>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="React Meetup Chennai" required />
          </FormField>
          <FormField label="Description" error={errors.description?.[0]}>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              placeholder="What's this event about?"
              className="w-full rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-soft)]"
            />
          </FormField>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField label="Date & time" error={errors.date?.[0]}>
              <Input type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </FormField>
            <FormField label="Capacity" error={errors.capacity?.[0]}>
              <Input type="number" min="1" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} required />
            </FormField>
          </div>
          <FormField label="Location" error={errors.location?.[0]}>
            <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Chennai" required />
          </FormField>
          {errors.detail && <p className="text-sm text-[var(--danger)]">{errors.detail}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving…' : isEdit ? 'Save changes' : 'Create event'}
          </Button>
        </form>
      </div>
    </Layout>
  )
}
