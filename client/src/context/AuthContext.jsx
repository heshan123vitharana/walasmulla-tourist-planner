/**
 * AuthContext.jsx — Provides auth state (user, token) and login/register/logout.
 */
import { createContext, useContext, useEffect, useState } from 'react';
import * as api from '../api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  /* Restore session from localStorage on mount */
  useEffect(() => {
    const token = localStorage.getItem('wtp_token');
    if (token) {
      api.me()
        .then(({ user: u }) => setUser(u))
        .catch(() => localStorage.removeItem('wtp_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  async function register(username, password) {
    const { user: u, token } = await api.register({ username, password });
    localStorage.setItem('wtp_token', token);
    setUser(u);
    return u;
  }

  async function login(username, password) {
    const { user: u, token } = await api.login({ username, password });
    localStorage.setItem('wtp_token', token);
    setUser(u);
    return u;
  }

  function logout() {
    localStorage.removeItem('wtp_token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside <AuthProvider>');
  return ctx;
}
