import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/events', label: 'Events' },
  { to: '/guests', label: 'Guest Lists' },
  { to: '/reminders', label: 'Reminders' },
  { to: '/reports', label: 'Reports' },
];

export default function Sidebar() {
  return (
    <aside className="app-sidebar">
      <nav className="app-sidebar__nav" aria-label="Primary">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              'app-sidebar__link' + (isActive ? ' is-active' : '')
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Signature element: perforated ticket-stub edge separating nav from footer */}
      <div className="app-sidebar__stub" aria-hidden="true"></div>

      <div className="app-sidebar__footer">
        <div className="app-sidebar__event-code">EVT–2026–0148</div>
        <div className="app-sidebar__footer-label">Active workspace</div>
      </div>
    </aside>
  );
}
