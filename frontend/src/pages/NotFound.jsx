import { Link } from 'react-router-dom'
import Button from '../components/Button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg)] px-6 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--primary)]">Error 404</p>
      <h1 className="mt-2 font-display text-4xl font-bold text-[var(--text-primary)]">Page not found</h1>
      <p className="mt-3 text-[var(--text-muted)]">There's no event — or page — behind this link.</p>
      <Link to="/" className="mt-6">
        <Button>Back to dashboard</Button>
      </Link>
    </div>
  )
}
