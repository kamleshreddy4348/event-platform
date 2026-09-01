import { createContext, useContext, useEffect, useRef, useState } from 'react'
import client from '../api/client'

const AuthContext = createContext(null)

function storeSession({ token, expires_at }) {
  localStorage.setItem('eventhub_token', token)
  localStorage.setItem('eventhub_session_start', String(Date.now()))
  if (expires_at) {
    localStorage.setItem('eventhub_session_expires_at', expires_at)
  }
}

function clearSession() {
  localStorage.removeItem('eventhub_token')
  localStorage.removeItem('eventhub_session_start')
  localStorage.removeItem('eventhub_session_expires_at')
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sessionExpired, setSessionExpired] = useState(false)
  const expiryTimer = useRef(null)

  const scheduleExpiry = (expiresAtIso) => {
    if (expiryTimer.current) clearTimeout(expiryTimer.current)
    if (!expiresAtIso) return
    const msLeft = new Date(expiresAtIso).getTime() - Date.now()
    if (msLeft <= 0) {
      forceLogout()
      return
    }
    // setTimeout has a ~24.8 day max; our expiry window is always far shorter, so this is safe.
    expiryTimer.current = setTimeout(forceLogout, msLeft)
  }

  const forceLogout = () => {
    clearSession()
    setUser(null)
    setSessionExpired(true)
  }

  useEffect(() => {
    const token = localStorage.getItem('eventhub_token')
    if (!token) {
      setLoading(false)
      return
    }
    if (!localStorage.getItem('eventhub_session_start')) {
      localStorage.setItem('eventhub_session_start', String(Date.now()))
    }
    client.get('/auth/me/')
      .then((res) => {
        setUser(res.data)
        if (res.data.expires_at) {
          localStorage.setItem('eventhub_session_expires_at', res.data.expires_at)
          scheduleExpiry(res.data.expires_at)
        }
      })
      .catch(() => clearSession())
      .finally(() => setLoading(false))

    return () => { if (expiryTimer.current) clearTimeout(expiryTimer.current) }
  }, [])

  // Listen for 401s raised anywhere in the app (an expired/invalid token) and
  // drop the user back to a logged-out state so they see the login screen.
  useEffect(() => {
    const handler = () => forceLogout()
    window.addEventListener('eventhub:unauthorized', handler)
    return () => window.removeEventListener('eventhub:unauthorized', handler)
  }, [])

  const login = async (username, password) => {
    const res = await client.post('/auth/login/', { username, password })
    storeSession(res.data)
    setSessionExpired(false)
    setUser(res.data.user)
    scheduleExpiry(res.data.expires_at)
    return res.data.user
  }

  const register = async (payload) => {
    const res = await client.post('/auth/register/', payload)
    storeSession(res.data)
    setSessionExpired(false)
    setUser(res.data.user)
    scheduleExpiry(res.data.expires_at)
    return res.data.user
  }

  const logout = async () => {
    try { await client.post('/auth/logout/') } catch (_) { /* noop */ }
    if (expiryTimer.current) clearTimeout(expiryTimer.current)
    clearSession()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, sessionExpired, setSessionExpired, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
