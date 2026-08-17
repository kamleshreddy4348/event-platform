import { createContext, useContext, useEffect, useState } from 'react';
import apiClient from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // On first load, if we have a saved token, ask the backend "who am I?"
  // so a page refresh doesn't log the person out.
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setIsLoading(false);
      return;
    }
    apiClient
      .get('/auth/me/')
      .then((res) => setUser(res.data))
      .catch(() => localStorage.removeItem('authToken'))
      .finally(() => setIsLoading(false));
  }, []);

  async function register({ username, email, password, role }) {
    const res = await apiClient.post('/auth/register/', { username, email, password, role });
    localStorage.setItem('authToken', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  }

  async function login({ username, password }) {
    const res = await apiClient.post('/auth/login/', { username, password });
    localStorage.setItem('authToken', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  }

  function logout() {
    localStorage.removeItem('authToken');
    setUser(null);
  }

  async function requestPasswordReset({ email }) {
    await apiClient.post('/auth/password-reset/', { email });
  }

  async function confirmPasswordReset({ uid, token, newPassword }) {
    await apiClient.post('/auth/password-reset-confirm/', {
      uid,
      token,
      new_password: newPassword,
    });
  }

  const value = {
    user,
    isLoading,
    register,
    login,
    logout,
    requestPasswordReset,
    confirmPasswordReset,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Small helper so pages can just call useAuth() instead of importing
// AuthContext + useContext every time.
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside an <AuthProvider>');
  }
  return ctx;
}
