import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import FormField from '../components/FormField'
import Input from '../components/Input'
import Button from '../components/Button'

export default function Login() {
  const { login, sessionExpired, setSessionExpired } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.username, form.password)
      setSessionExpired(false)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not log in. Check your details.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] p-4">
      <div className="grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-3xl border border-[var(--surface-border)] bg-[var(--surface)] shadow-xl md:grid-cols-2">
        <div className="flex flex-col justify-center px-8 py-12 sm:px-12">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🗓️</span>
            <span className="font-display text-xl font-bold">Event<span className="text-[var(--primary)]">Hub</span></span>
          </div>
          <p className="mt-1 text-xs text-[var(--text-faint)]">Manage Events. Create Experiences.</p>

          <h1 className="mt-8 font-display text-2xl font-bold text-[var(--text-primary)]">Welcome back!</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Please log in to your account</p>

          {sessionExpired && (
            <p className="mt-4 rounded-xl bg-[var(--warn-soft)] px-3.5 py-2.5 text-sm text-[var(--warn)]">
              Your session expired — please log in again.
            </p>
          )}

          <form onSubmit={submit} className="mt-8 space-y-5">
            <FormField label="Username">
              <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="Enter your username" required />
            </FormField>
            <FormField label="Password">
              <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Enter your password" required />
            </FormField>
            {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-[var(--text-muted)]">
                <input type="checkbox" className="rounded border-[var(--surface-border)]" />
                Remember me
              </label>
              <Link to="/password-reset" className="text-[var(--primary)] hover:underline">Forgot Password?</Link>
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Logging in…' : 'Login'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
            Don't have an account? <Link to="/register" className="font-medium text-[var(--primary)] hover:underline">Sign up</Link>
          </p>
        </div>

        <div className="auth-illustration hidden flex-col items-center justify-center p-10 text-center text-white md:flex">
          <span className="text-6xl">🎉</span>
          <h2 className="mt-4 font-display text-xl font-semibold">Every great event starts with a plan</h2>
          <p className="mt-2 max-w-xs text-sm text-white/80">
            Create, manage, and track your events — all from one beautiful dashboard.
          </p>
        </div>
      </div>
    </div>
  )
}
