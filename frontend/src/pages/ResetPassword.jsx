import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

export default function ResetPassword() {
  const { confirmPasswordReset } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const uid = searchParams.get('uid');
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // If someone lands here without the link's parameters (e.g. typed the
  // URL by hand), there's nothing useful we can do — send them back.
  if (!uid || !token) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-card__eyebrow">Eventry</div>
          <h1 className="auth-card__title">Invalid reset link</h1>
          <p className="auth-card__body">
            This link is missing some information. Please request a new one.
          </p>
          <p className="auth-card__footer">
            <Link to="/forgot-password">Request a new link</Link>
          </p>
        </div>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await confirmPasswordReset({ uid, token, newPassword });
      setIsDone(true);
    } catch (err) {
      const message = err.response?.data?.detail || err.response?.data?.new_password?.[0];
      setError(message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isDone) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-card__eyebrow">Eventry</div>
          <h1 className="auth-card__title">Password updated</h1>
          <p className="auth-card__body">You can now log in with your new password.</p>
          <button className="auth-submit" onClick={() => navigate('/login')}>
            Go to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-card__eyebrow">Eventry</div>
        <h1 className="auth-card__title">Choose a new password</h1>

        {error && <div className="auth-card__error">{error}</div>}

        <label className="auth-field">
          <span>New password</span>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </label>

        <button className="auth-submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save new password'}
        </button>
      </form>
    </div>
  );
}
