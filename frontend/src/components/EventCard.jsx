import { Link } from 'react-router-dom'

const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']

export default function EventCard({ event }) {
  const d = new Date(event.date)
  const day = d.getDate()
  const month = MONTHS[d.getMonth()]
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const isPast = d < new Date()

  return (
    <Link to={`/events/${event.id}`} className="card group flex gap-4 p-4 transition-shadow hover:shadow-lg">
      <div className="flex w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-[var(--primary-soft)] py-2 text-center">
        <span className="font-display text-2xl font-bold leading-none text-[var(--primary-dark)]">{day}</span>
        <span className="mt-1 text-[10px] font-bold tracking-widest text-[var(--primary)]">{month}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-display text-lg font-semibold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">
            {event.title}
          </h3>
          <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${isPast ? 'bg-[var(--surface-border)] text-[var(--text-muted)]' : 'bg-[var(--info-soft)] text-[var(--info)]'}`}>
            {isPast ? 'Past' : 'Upcoming'}
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-[var(--text-muted)]">{event.description}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--text-faint)]">
          <span>📍 {event.location}</span>
          <span>🕒 {time}</span>
          <span>👥 {event.rsvp_count ?? 0} going</span>
        </div>
      </div>
    </Link>
  )
}
