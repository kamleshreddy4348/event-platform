import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import RequireAuth from './components/RequireAuth';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Events from './pages/Events';
import EventForm from './pages/EventForm';
import EventDetail from './pages/EventDetail';

function ComingSoon({ label }) {
  return (
    <div>
      <h1 style={{ fontSize: 24 }}>{label}</h1>
      <p style={{ color: 'var(--slate)', marginTop: 8 }}>
        Coming later this week.
      </p>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/new" element={<EventForm />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/guests" element={<ComingSoon label="Guest Lists" />} />
        <Route path="/reminders" element={<ComingSoon label="Reminders" />} />
        <Route path="/reports" element={<ComingSoon label="Reports" />} />
      </Route>
    </Routes>
  );
}
