import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import EventList from './pages/EventList'
import EventDetail from './pages/EventDetail'
import EventForm from './pages/EventForm'
import GuestList from './pages/GuestList'
import Notifications from './pages/Notifications'
import Login from './pages/Login'
import Register from './pages/Register'
import PasswordReset from './pages/PasswordReset'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/password-reset" element={<PasswordReset />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/events" element={<ProtectedRoute><EventList /></ProtectedRoute>} />
      <Route path="/events/new" element={<ProtectedRoute requireAdmin><EventForm /></ProtectedRoute>} />
      <Route path="/events/:id" element={<ProtectedRoute><EventDetail /></ProtectedRoute>} />
      <Route path="/events/:id/edit" element={<ProtectedRoute requireAdmin><EventForm /></ProtectedRoute>} />
      <Route path="/events/:id/guests" element={<ProtectedRoute requireAdmin><GuestList /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
