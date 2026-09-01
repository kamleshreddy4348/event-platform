import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationsContext'
import SessionTimer from './SessionTimer'

export default function Topbar({ title, subtitle }) {
  const { user, logout } = useAuth()
  const { unreadCount } = useNotifications()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const isAdmin = user?.role === 'admin'

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--surface-border)] bg-[var(--bg)]/90 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-5 py-4 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            className="rounded-lg border border-[var(--surface-border)] p-2 lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
          >
            ☰
          </button>
          <div>
            <h1 className="font-display text-xl font-semibold text-[var(--text-primary)] sm:text-2xl">{title}</h1>
            {subtitle && <p className="text-xs text-[var(--text-muted)] sm:text-sm">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <SessionTimer />

          <Link to="/notifications" className="relative rounded-full border border-[var(--surface-border)] bg-[var(--surface)] p-2 hover:border-[var(--primary)]">
            <span className="text-base leading-none">🔔</span>
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--danger)] px-1 text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          <div className="flex items-center gap-2 rounded-full border border-[var(--surface-border)] bg-[var(--surface)] py-1 pl-1 pr-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-bold text-white">
              {user?.username?.[0]?.toUpperCase() || '?'}
            </span>
            <span className="hidden text-sm font-medium sm:inline">{user?.username}</span>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="flex flex-col gap-1 border-t border-[var(--surface-border)] bg-[var(--surface)] px-5 py-3 lg:hidden">
          <Link to="/" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-sm hover:bg-[var(--primary-soft)]">🏠 Dashboard</Link>
          <Link to="/events" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-sm hover:bg-[var(--primary-soft)]">📅 Events</Link>
          {isAdmin && (
            <Link to="/events/new" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-sm hover:bg-[var(--primary-soft)]">➕ Host an event</Link>
          )}
          <Link to="/notifications" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-sm hover:bg-[var(--primary-soft)]">
            🔔 Notifications{unreadCount > 0 ? ` (${unreadCount})` : ''}
          </Link>
          <button onClick={handleLogout} className="rounded-lg px-3 py-2 text-left text-sm text-[var(--danger)] hover:bg-[var(--danger-soft)]">🚪 Logout</button>
        </div>
      )}
    </header>
  )
}
