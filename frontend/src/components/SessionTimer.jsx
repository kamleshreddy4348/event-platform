import { useEffect, useState } from 'react'

function formatDuration(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')
  const s = String(totalSeconds % 60).padStart(2, '0')
  return `${h}:${m}:${s}`
}

export default function SessionTimer() {
  const [elapsed, setElapsed] = useState('00:00:00')
  const [remaining, setRemaining] = useState(null)
  const [loginTime, setLoginTime] = useState(null)

  useEffect(() => {
    const start = Number(localStorage.getItem('eventhub_session_start')) || Date.now()
    const expiresAt = localStorage.getItem('eventhub_session_expires_at')
    setLoginTime(new Date(start))

    const tick = () => {
      setElapsed(formatDuration(Date.now() - start))
      if (expiresAt) {
        setRemaining(formatDuration(new Date(expiresAt).getTime() - Date.now()))
      }
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [])

  const nearExpiry = remaining && remaining < '01:00:00'

  return (
    <div className={`flex items-center gap-2 rounded-full border px-3 py-1.5 ${
      nearExpiry ? 'border-[var(--warn)] bg-[var(--warn-soft)]' : 'border-[var(--surface-border)] bg-[var(--primary-soft)]'
    }`}>
      <span className={`h-2 w-2 rounded-full animate-pulse ${nearExpiry ? 'bg-[var(--warn)]' : 'bg-[var(--success)]'}`} />
      <span className={`font-mono text-xs font-medium ${nearExpiry ? 'text-[var(--warn)]' : 'text-[var(--primary-dark)]'}`}>
        Session {elapsed}
      </span>
      {loginTime && (
        <span className="hidden font-mono text-[11px] text-[var(--text-faint)] sm:inline">
          · since {loginTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      )}
      {remaining && (
        <span className="hidden font-mono text-[11px] text-[var(--text-faint)] md:inline">
          · expires in {remaining}
        </span>
      )}
    </div>
  )
}
