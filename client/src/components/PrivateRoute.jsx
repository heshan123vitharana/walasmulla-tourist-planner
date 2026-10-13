/**
 * PrivateRoute.jsx — Redirects to /login if not authenticated.
 */
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function PrivateRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return (
    <div className="flex justify-center py-32">
      <Loader2 size={28} className="text-primary-400 animate-spin" />
    </div>
  );

  return user ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />;
}
