import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RequireAuth({ children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    // Still checking localStorage/asking the backend "who am I" — avoid a
    // flash of the login page while that's in flight.
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
