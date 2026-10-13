/**
 * AdminRoute.jsx — Redirects non-admins to homepage.
 */
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function AdminRoute() {
  const { user, loading, isAdmin } = useAuth();

  if (loading) return (
    <div className="flex justify-center py-32">
      <Loader2 size={28} className="text-primary-400 animate-spin" />
    </div>
  );

  if (!user)    return <Navigate to="/login"  replace />;
  if (!isAdmin) return <Navigate to="/"       replace />;

  return <Outlet />;
}
