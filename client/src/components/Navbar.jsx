/**
 * Navbar.jsx — Top navigation bar with links and auth state.
 */
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePlan } from '../context/PlanContext';
import { MapPin, Calendar, LogIn, LogOut, User, LayoutDashboard, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { placeIds } = usePlan();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/');
  }

  const navLink = 'flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all text-sm font-medium';
  const activeLink = 'flex items-center gap-2 px-3 py-2 rounded-lg text-primary-300 bg-primary-900/40 text-sm font-medium';

  return (
    <nav className="sticky top-0 z-50 glassmorphism border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-white no-underline hover:text-white">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-glow">
              <MapPin size={16} className="text-white" />
            </div>
            <span className="font-bold text-gradient text-lg hidden sm:block">Walasmulla Planner</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/places" className={({ isActive }) => isActive ? activeLink : navLink}>
              <MapPin size={16} /> Explore
            </NavLink>
            <NavLink to="/planner" className={({ isActive }) => isActive ? activeLink : navLink}>
              <Calendar size={16} />
              Day Planner
              {placeIds.length > 0 && (
                <span className="ml-1 w-5 h-5 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center">
                  {placeIds.length}
                </span>
              )}
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin" className={({ isActive }) => isActive ? activeLink : navLink}>
                <LayoutDashboard size={16} /> Admin
              </NavLink>
            )}
          </div>

          {/* Auth controls */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                <Link to="/my-plans" className={navLink}>
                  <User size={16} /> {user.username}
                </Link>
                <button onClick={handleLogout} className="btn-ghost text-sm">
                  <LogOut size={16} /> Sign out
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-primary text-sm">
                <LogIn size={16} /> Sign in
              </Link>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button className="md:hidden btn-ghost p-2" onClick={() => setOpen(!open)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden border-t border-white/10 bg-surface/95 px-4 py-3 flex flex-col gap-1">
          <NavLink to="/places" className={navLink} onClick={() => setOpen(false)}>
            <MapPin size={16} /> Explore Places
          </NavLink>
          <NavLink to="/planner" className={navLink} onClick={() => setOpen(false)}>
            <Calendar size={16} /> Day Planner {placeIds.length > 0 && `(${placeIds.length})`}
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin" className={navLink} onClick={() => setOpen(false)}>
              <LayoutDashboard size={16} /> Admin Dashboard
            </NavLink>
          )}
          {user ? (
            <>
              <Link to="/my-plans" className={navLink} onClick={() => setOpen(false)}>
                <User size={16} /> My Plans
              </Link>
              <button onClick={() => { handleLogout(); setOpen(false); }} className={navLink}>
                <LogOut size={16} /> Sign out
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-primary w-full justify-center mt-1" onClick={() => setOpen(false)}>
              <LogIn size={16} /> Sign in
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
