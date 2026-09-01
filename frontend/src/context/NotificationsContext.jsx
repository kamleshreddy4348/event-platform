import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import client from '../api/client'
import { useAuth } from './AuthContext'

const NotificationsContext = createContext(null)

export function NotificationsProvider({ children }) {
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  const refresh = useCallback(() => {
    if (!user) return
    client.get('/notifications/unread-count/')
      .then((res) => setUnreadCount(res.data.count))
      .catch(() => {})
  }, [user])

  useEffect(() => {
    if (!user) {
      setUnreadCount(0)
      return
    }
    refresh()
    const interval = setInterval(refresh, 30000) // poll every 30s
    return () => clearInterval(interval)
  }, [user, refresh])

  return (
    <NotificationsContext.Provider value={{ unreadCount, refresh }}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider')
  return ctx
}
