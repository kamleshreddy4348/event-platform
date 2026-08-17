import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

export default function ForgotPassword() {
  const { requestPasswordReset } = useAuth();

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await requestPasswordReset({ email });
    } finally {
      // We always show the same success message, whether or not that email
      // is registered — this matches the backend, which intentionally
      // doesn't reveal whether an account exists.
      setIsSubmitting(false);
      setIsSubmitted(true);
    }
  }

  if (isSubmitted) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-card__eyebrow">Eventry</div>
          <h1 className="auth-card__title">Check your email</h1>
          <p className="auth-card__body">
            If an account exists for <strong>{email}</strong>, we've sent a link to
            reset your password.
          </p>
          <p className="auth-card__footer">
            <Link to="/login">Back to login</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-card__eyebrow">Eventry</div>
        <h1 className="auth-card__title">Reset your password</h1>
        <p className="auth-card__body">
          Enter your email and we'll send you a link to reset your password.
        </p>

        <label className="auth-field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>

        <button className="auth-submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Sending…' : 'Send reset link'}
        </button>

        <p className="auth-card__footer">
          <Link to="/login">Back to login</Link>
        </p>
      </form>
    </div>
  );
}
