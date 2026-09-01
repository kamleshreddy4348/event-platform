import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import FormField from '../components/FormField'
import Input from '../components/Input'
import Button from '../components/Button'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'attendee' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    try {
      await register(form)
      navigate('/')
    } catch (err) {
      setErrors(err.response?.data || { detail: 'Registration failed.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] p-4">
      <div className="grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-3xl border border-[var(--surface-border)] bg-[var(--surface)] shadow-xl md:grid-cols-2">
        <div className="auth-illustration hidden flex-col items-center justify-center p-10 text-center text-white md:flex">
          <span className="text-6xl">🎟️</span>
          <h2 className="mt-4 font-display text-xl font-semibold">Get your pass</h2>
          <p className="mt-2 max-w-xs text-sm text-white/80">
            Join EventHub to RSVP to events and host your own.
          </p>
        </div>

        <div className="flex flex-col justify-center px-8 py-12 sm:px-12">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🗓️</span>
            <span className="font-display text-xl font-bold">Event<span className="text-[var(--primary)]">Hub</span></span>
          </div>
          <h1 className="mt-8 font-display text-2xl font-bold text-[var(--text-primary)]">Create your account</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Start hosting and RSVPing in minutes.</p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <FormField label="Username" error={errors.username?.[0]}>
              <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="alice" required />
            </FormField>
            <FormField label="Email" error={errors.email?.[0]}>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="alice@example.com" required />
            </FormField>
            <FormField label="Password" error={errors.password?.[0]}>
              <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 8 characters" required />
            </FormField>
            <FormField label="I want to">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'attendee', label: 'Attend events', hint: 'Browse & RSVP' },
                  { value: 'admin', label: 'Host events', hint: 'Create & manage' },
                ].map((opt) => (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => setForm({ ...form, role: opt.value })}
                    className={`rounded-xl border px-3 py-2.5 text-left transition-colors ${
                      form.role === opt.value
                        ? 'border-[var(--primary)] bg-[var(--primary-soft)]'
                        : 'border-[var(--surface-border)] hover:border-[var(--primary)]'
                    }`}
                  >
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{opt.label}</p>
                    <p className="text-xs text-[var(--text-muted)]">{opt.hint}</p>
                  </button>
                ))}
              </div>
            </FormField>
            {errors.detail && <p className="text-sm text-[var(--danger)]">{errors.detail}</p>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Creating account…' : 'Sign up'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
            Already have an account? <Link to="/login" className="font-medium text-[var(--primary)] hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
