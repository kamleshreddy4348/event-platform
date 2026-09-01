import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="mx-auto max-w-3xl px-6 py-16 text-[var(--text-muted)]">Loading…</div>
  if (!user) return <Navigate to="/login" replace />
  if (requireAdmin && user.role !== 'admin') return <Navigate to="/" replace />
  return children
}
