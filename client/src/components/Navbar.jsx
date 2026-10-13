/**
 * Navbar.jsx — Premium, high-polish navigation bar with interactive links and auth controls.
 */
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePlan } from '../context/PlanContext';
import {
  Compass, MapPin, Calendar, LogIn, LogOut, User,
  LayoutDashboard, Menu, X, Sparkles, Shield, ChevronRight
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { placeIds } = usePlan();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/');
  }

  const baseNavLink =
    'relative flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200';
  const inactiveLink =
    `${baseNavLink} text-slate-300 hover:text-white hover:bg-white/5`;
  const activeLink =
    `${baseNavLink} text-teal-300 bg-primary-950/90 border border-primary-700/60 shadow-[0_0_12px_rgba(20,184,166,0.25)] font-semibold`;

  return (
    <nav className="sticky top-0 z-50 bg-[#061116]/85 backdrop-blur-2xl border-b border-surface-border/60 shadow-xl shadow-black/25">
      {/* Top ambient glowing line */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-teal-400/60 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group text-white no-underline transition-transform duration-200 hover:scale-[1.02]"
          >
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-teal-700 p-0.5 shadow-glow flex items-center justify-center">
              <div className="w-full h-full rounded-[10px] bg-[#071922] flex items-center justify-center text-teal-400 group-hover:text-teal-300 transition-colors">
                <Compass size={22} className="group-hover:rotate-45 transition-transform duration-500" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-white leading-tight">
                Walasmulla <span className="text-gradient">Planner</span>
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 -mt-0.5">
                Southern Sri Lanka
              </span>
            </div>
          </Link>

          {/* Desktop Center Navigation Capsule */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-card/60 border border-surface-border/60 shadow-inner">
            <NavLink
              to="/places"
              className={({ isActive }) => (isActive ? activeLink : inactiveLink)}
            >
              <MapPin size={15} />
              <span>Explore</span>
            </NavLink>

            <NavLink
              to="/planner"
              className={({ isActive }) => (isActive ? activeLink : inactiveLink)}
            >
              <Calendar size={15} />
              <span>Day Planner</span>
              {placeIds.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-teal-500 to-primary-600 text-white text-[11px] font-bold leading-none shadow-[0_0_8px_#14b8a6] animate-pulse">
                  {placeIds.length}
                </span>
              )}
            </NavLink>

            {user && (
              <NavLink
                to="/my-plans"
                className={({ isActive }) => (isActive ? activeLink : inactiveLink)}
              >
                <Sparkles size={15} />
                <span>My Plans</span>
              </NavLink>
            )}

            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) => (isActive ? activeLink : inactiveLink)}
              >
                <Shield size={15} className="text-amber-400" />
                <span>Admin</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  PRO
                </span>
              </NavLink>
            )}
          </div>

          {/* Right Action & Auth Controls */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                {/* User chip */}
                <Link
                  to={isAdmin ? '/admin' : '/my-plans'}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-primary-950/60 border border-primary-800/60 text-slate-200 hover:border-teal-500/50 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-teal-500 to-primary-600 flex items-center justify-center text-white text-xs font-bold uppercase shadow-sm">
                    {user.username.charAt(0)}
                  </div>
                  <span className="text-xs font-medium text-slate-200">
                    {user.username}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase bg-teal-500/10 text-teal-300 border border-teal-500/20">
                    {user.role}
                  </span>
                </Link>

                {/* Sign out */}
                <button
                  onClick={handleLogout}
                  className="btn-ghost text-xs px-2.5 py-1.5 rounded-lg border border-surface-border text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition-colors"
                  title="Sign out"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="btn-ghost text-sm px-3.5 py-2 text-slate-300 hover:text-white"
                >
                  <LogIn size={15} /> Sign in
                </Link>

                <Link
                  to="/register"
                  className="btn-primary text-sm px-4 py-2 rounded-xl shadow-glow"
                >
                  Get Started <ChevronRight size={15} />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="md:hidden flex items-center gap-2">
            {placeIds.length > 0 && (
              <Link
                to="/planner"
                className="px-2 py-1 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-bold flex items-center gap-1"
              >
                <Calendar size={12} /> {placeIds.length}
              </Link>
            )}
            <button
              onClick={() => setOpen(!open)}
              className="p-2 rounded-xl bg-surface-card border border-surface-border text-slate-300 hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {open && (
        <div className="md:hidden border-t border-surface-border/70 bg-[#061116]/95 backdrop-blur-2xl px-5 py-4 flex flex-col gap-2.5 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          <NavLink
            to="/places"
            className={({ isActive }) => (isActive ? activeLink : inactiveLink)}
            onClick={() => setOpen(false)}
          >
            <MapPin size={16} /> Explore Places
          </NavLink>

          <NavLink
            to="/planner"
            className={({ isActive }) => (isActive ? activeLink : inactiveLink)}
            onClick={() => setOpen(false)}
          >
            <Calendar size={16} /> Day Planner
            {placeIds.length > 0 && (
              <span className="ml-auto px-2 py-0.5 rounded-full bg-teal-500 text-slate-950 text-xs font-bold">
                {placeIds.length} Stops
              </span>
            )}
          </NavLink>

          {user && (
            <NavLink
              to="/my-plans"
              className={({ isActive }) => (isActive ? activeLink : inactiveLink)}
              onClick={() => setOpen(false)}
            >
              <Sparkles size={16} /> My Saved Plans
            </NavLink>
          )}

          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) => (isActive ? activeLink : inactiveLink)}
              onClick={() => setOpen(false)}
            >
              <LayoutDashboard size={16} /> Admin Dashboard
            </NavLink>
          )}

          <div className="pt-2 border-t border-surface-border/60 mt-1">
            {user ? (
              <div className="flex items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-bold uppercase">
                    {user.username.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-200">
                      {user.username}
                    </span>
                    <span className="text-[10px] text-teal-400 capitalize">
                      {user.role} account
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    handleLogout();
                    setOpen(false);
                  }}
                  className="btn-ghost text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5"
                >
                  <LogOut size={14} /> Sign out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <Link
                  to="/login"
                  className="btn-secondary w-full justify-center text-sm py-2.5"
                  onClick={() => setOpen(false)}
                >
                  <LogIn size={15} /> Sign in
                </Link>
                <Link
                  to="/register"
                  className="btn-primary w-full justify-center text-sm py-2.5 shadow-glow"
                  onClick={() => setOpen(false)}
                >
                  Create Free Account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
