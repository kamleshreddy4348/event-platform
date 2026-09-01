import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import client from '../api/client'
import FormField from '../components/FormField'
import Input from '../components/Input'
import Button from '../components/Button'

export default function PasswordReset() {
  const [searchParams] = useSearchParams()
  const uidFromLink = searchParams.get('uid')
  const tokenFromLink = searchParams.get('token')

  const [step, setStep] = useState(uidFromLink && tokenFromLink ? 'confirm' : 'request')
  const [email, setEmail] = useState('')
  const [uid, setUid] = useState(uidFromLink || '')
  const [token, setToken] = useState(tokenFromLink || '')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState(
    uidFromLink && tokenFromLink ? 'Enter a new password to finish resetting your account.' : ''
  )
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // If the request came from a real emailed link, uid/token are already
  // filled in and hidden — the person never needs to see or paste them.
  const cameFromEmailLink = Boolean(uidFromLink && tokenFromLink)

  const requestReset = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await client.post('/auth/password-reset/', { email })
      setMessage(res.data.detail)
      if (res.data.uid) {
        // Dev mode only: no real email server, so the API hands the
        // uid/token back directly instead of them arriving by email.
        setUid(res.data.uid)
        setToken(res.data.token)
        setStep('confirm')
      } else {
        // Production: a real email was sent — nothing more to do here
        // until the person clicks the link in their inbox.
        setStep('sent')
      }
    } catch (err) {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const confirmReset = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await client.post('/auth/password-reset-confirm/', { uid, token, new_password: newPassword })
      setStep('done')
    } catch (err) {
      setError(err.response?.data?.detail || 'Reset link invalid or expired.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] p-4">
      <div className="w-full max-w-md rounded-3xl border border-[var(--surface-border)] bg-[var(--surface)] p-8 shadow-xl sm:p-10">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🗓️</span>
          <span className="font-display text-xl font-bold">Event<span className="text-[var(--primary)]">Hub</span></span>
        </div>
        <h1 className="mt-8 font-display text-2xl font-bold text-[var(--text-primary)]">Reset password</h1>

        {step === 'request' && (
          <>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Enter your email and we'll send you a reset link.</p>
            <form onSubmit={requestReset} className="mt-6 space-y-5">
              <FormField label="Email">
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alice@example.com" required />
              </FormField>
              {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Sending…' : 'Send reset link'}
              </Button>
            </form>
          </>
        )}

        {step === 'sent' && (
          <div className="mt-6 rounded-2xl border border-[var(--info)]/30 bg-[var(--info-soft)] p-6 text-center">
            <p className="font-display text-lg font-semibold text-[var(--info)]">Check your email</p>
            <p className="mt-2 text-sm text-[var(--text-muted)]">{message}</p>
          </div>
        )}

        {step === 'confirm' && (
          <>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{message}</p>
            <form onSubmit={confirmReset} className="mt-6 space-y-5">
              {!cameFromEmailLink && (
                <>
                  <FormField label="Reset UID">
                    <Input value={uid} onChange={(e) => setUid(e.target.value)} placeholder="from your reset email" required />
                  </FormField>
                  <FormField label="Reset token">
                    <Input value={token} onChange={(e) => setToken(e.target.value)} placeholder="from your reset email" required />
                  </FormField>
                </>
              )}
              <FormField label="New password">
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 8 characters" required />
              </FormField>
              {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Resetting…' : 'Set new password'}
              </Button>
            </form>
          </>
        )}

        {step === 'done' && (
          <div className="mt-6 rounded-2xl border border-[var(--success)]/30 bg-[var(--success-soft)] p-6 text-center">
            <p className="font-display text-lg font-semibold text-[var(--success)]">Password updated</p>
            <Link to="/login" className="mt-3 inline-block text-sm font-medium text-[var(--primary)] hover:underline">Back to log in →</Link>
          </div>
        )}
      </div>
    </div>
  )
}
