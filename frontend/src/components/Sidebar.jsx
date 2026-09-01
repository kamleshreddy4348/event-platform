import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationsContext'

export default function Sidebar() {
  const { user, logout } = useAuth()
  const { unreadCount } = useNotifications()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'admin'

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-[var(--primary-soft)] text-[var(--primary-dark)] border-l-4 border-[var(--primary)] pl-3'
        : 'text-[var(--text-muted)] hover:bg-[var(--primary-soft)]/60 hover:text-[var(--text-primary)]'
    }`

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-[var(--surface-border)] bg-[var(--sidebar-bg)] px-4 py-6 lg:flex">
      <div className="flex items-center gap-2 px-2">
        <span className="text-2xl">🗓️</span>
        <span className="font-display text-xl font-bold text-[var(--text-primary)]">
          Event<span className="text-[var(--primary)]">Hub</span>
        </span>
      </div>
      {user && (
        <span className="ml-2 mt-1 w-fit rounded-full bg-[var(--primary-soft)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--primary-dark)]">
          {isAdmin ? 'Admin' : 'Attendee'}
        </span>
      )}

      <nav className="mt-8 flex flex-1 flex-col gap-1">
        <NavLink to="/" end className={linkClass}>
          <span>🏠</span> Dashboard
        </NavLink>
        <NavLink to="/events" className={linkClass}>
          <span>📅</span> Events
        </NavLink>
        {isAdmin && (
          <NavLink to="/events/new" className={linkClass}>
            <span>➕</span> Host an event
          </NavLink>
        )}
        <NavLink to="/notifications" className={linkClass}>
          <span>🔔</span> Notifications
          {unreadCount > 0 && (
            <span className="ml-auto rounded-full bg-[var(--danger)] px-2 py-0.5 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </NavLink>
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--text-muted)] hover:bg-[var(--danger-soft)] hover:text-[var(--danger)] transition-colors"
      >
        <span>🚪</span>
        Logout
      </button>
    </aside>
  )
}
