/**
 * LoginPage.jsx — Login form with Show/Hide password toggle,
 * input validation, and 3-attempt / 30-second cooldown lockout.
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Loader2, Eye, EyeOff, Lock, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const MAX_FAILED_ATTEMPTS = 3;
const LOCKOUT_SECONDS = 30;
const STORAGE_LOCK_KEY = 'wtp_login_lock_until';
const STORAGE_ATTEMPTS_KEY = 'wtp_login_failed_count';

export default function LoginPage() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const toast      = useToast();

  const [form, setForm]                 = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]               = useState(null);
  const [loading, setLoad]              = useState(false);
  const [waitSeconds, setWaitSeconds]   = useState(0);

  // Monitor and tick countdown timer if locked
  useEffect(() => {
    function checkLockout() {
      const lockUntil = parseInt(localStorage.getItem(STORAGE_LOCK_KEY) || '0', 10);
      const remaining = Math.ceil((lockUntil - Date.now()) / 1000);
      if (remaining > 0) {
        setWaitSeconds(remaining);
      } else {
        setWaitSeconds(0);
        localStorage.removeItem(STORAGE_LOCK_KEY);
      }
    }

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    // Prevent submission during cooldown
    if (waitSeconds > 0) {
      toast.warning(`Please wait ${waitSeconds}s before trying again.`, 'Locked');
      return;
    }

    const trimmedUsername = form.username.trim();
    if (!trimmedUsername) {
      setError('Username is required.');
      toast.warning('Please enter your username', 'Validation');
      return;
    }
    if (!form.password) {
      setError('Password is required.');
      toast.warning('Please enter your password', 'Validation');
      return;
    }

    setLoad(true);
    try {
      const user = await login(trimmedUsername, form.password);

      // Successful login — reset lock states
      localStorage.removeItem(STORAGE_LOCK_KEY);
      localStorage.removeItem(STORAGE_ATTEMPTS_KEY);
      setWaitSeconds(0);

      toast.success(`Welcome back, ${user.username}!`, 'Signed In');
      navigate(user.role === 'admin' ? '/admin' : '/my-plans');
    } catch (err) {
      const currentFailures = parseInt(localStorage.getItem(STORAGE_ATTEMPTS_KEY) || '0', 10) + 1;

      if (currentFailures >= MAX_FAILED_ATTEMPTS) {
        // Enforce 30-second cooldown
        const lockExpiry = Date.now() + LOCKOUT_SECONDS * 1000;
        localStorage.setItem(STORAGE_LOCK_KEY, lockExpiry.toString());
        localStorage.removeItem(STORAGE_ATTEMPTS_KEY);
        setWaitSeconds(LOCKOUT_SECONDS);
        setError(`3 failed login attempts. Account access is temporarily locked for 30 seconds.`);
        toast.error('3 failed attempts. Security cooldown active for 30 seconds.', 'Lockout Active');
      } else {
        localStorage.setItem(STORAGE_ATTEMPTS_KEY, currentFailures.toString());
        const remaining = MAX_FAILED_ATTEMPTS - currentFailures;
        setError(err.message || 'Invalid username or password');
        toast.error(
          `${err.message || 'Invalid credentials'}. (${remaining} attempt${remaining === 1 ? '' : 's'} remaining)`,
          'Sign In Failed'
        );
      }
    } finally {
      setLoad(false);
    }
  }

  const isLocked = waitSeconds > 0;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="card p-8 w-full max-w-sm shadow-2xl border-white/10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary-900/60 border border-primary-700/60 flex items-center justify-center mx-auto mb-4 text-teal-400">
            {isLocked ? <Lock size={22} className="text-amber-400" /> : <LogIn size={22} />}
          </div>
          <h1 className="text-2xl font-bold text-slate-100 mb-1">Welcome back</h1>
          <p className="text-slate-400 text-sm">Sign in to your Walasmulla account</p>
        </div>

        {/* Lockout Warning Banner */}
        {isLocked && (
          <div className="p-3.5 mb-5 rounded-xl bg-amber-950/40 border border-amber-600/50 text-amber-200 text-xs flex items-start gap-2.5 animate-pulse">
            <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-300">Security Cooldown Active</p>
              <p className="mt-0.5 text-amber-200/90 leading-relaxed">
                3 consecutive failed attempts. Please wait <strong className="text-amber-100">{waitSeconds}s</strong> before trying again.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="login-username">Username</label>
            <input
              id="login-username"
              type="text"
              autoComplete="username"
              placeholder="e.g. tourist1 or admin"
              className="input disabled:opacity-50 disabled:cursor-not-allowed"
              value={form.username}
              disabled={loading || isLocked}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="label" htmlFor="login-password">Password</label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                className="input pr-10 disabled:opacity-50 disabled:cursor-not-allowed"
                value={form.password}
                disabled={loading || isLocked}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                data-tooltip={showPassword ? 'Hide password' : 'Show password'}
                data-tooltip-pos="left"
                tabIndex={-1}
                disabled={isLocked}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}

          <button
            type="submit"
            disabled={loading || isLocked}
            className={`btn-primary w-full flex items-center justify-center gap-2 ${
              isLocked
                ? 'opacity-60 cursor-not-allowed bg-slate-800 border-slate-700 text-slate-400 shadow-none hover:bg-slate-800'
                : ''
            }`}
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : isLocked ? (
              <>
                <Lock size={16} className="text-amber-400" />
                <span>Locked ({waitSeconds}s)</span>
              </>
            ) : (
              <>
                <LogIn size={16} />
                <span>Sign in</span>
              </>
            )}
          </button>
        </form>

        <p className="text-center text-slate-400 text-sm mt-6">
          No account?{' '}
          <Link to="/register" className="text-teal-400 hover:text-teal-300 font-medium">Create one free →</Link>
        </p>
      </div>
    </div>
  );
}
