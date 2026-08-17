import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const initials = user
    ? user.username.slice(0, 2).toUpperCase()
    : '?';

  return (
    <header className="app-header">
      <div className="app-header__brand">
        <span className="app-header__mark">EM</span>
        <span className="app-header__name">Eventry</span>
      </div>

      <div className="app-header__search">
        <input
          type="text"
          placeholder="Search events, guests, or reports…"
          aria-label="Search"
        />
      </div>

      <div className="app-header__user">
        {user ? (
          <>
            <div className="app-header__badge" title={user.role}>
              <span className="app-header__badge-role">{user.role}</span>
            </div>
            <div className="app-header__avatar" aria-hidden="true">{initials}</div>
            <button className="app-header__logout" onClick={handleLogout}>
              Log out
            </button>
          </>
        ) : (
          <span className="app-header__badge-role">Not logged in</span>
        )}
      </div>
    </header>
  );
}
