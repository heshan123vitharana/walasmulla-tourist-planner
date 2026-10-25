/**
 * RegisterPage.jsx — Tourist self-registration form with Show/Hide password toggles,
 * real-time validation, and strength checks.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Loader2, Eye, EyeOff, Check, X, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const toast        = useToast();

  const [form, setForm]                               = useState({ username: '', password: '', confirm: '' });
  const [showPassword, setShowPassword]               = useState(false);
  const [showConfirm, setShowConfirm]                 = useState(false);
  const [error, setError]                             = useState(null);
  const [validationErrors, setValidationErrors]       = useState({});
  const [load, setLoad]                               = useState(false);

  function validateInputs() {
    const errors = {};
    const trimmedUsername = form.username.trim();

    if (!trimmedUsername) {
      errors.username = 'Username is required';
    } else if (trimmedUsername.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    } else if (trimmedUsername.length > 30) {
      errors.username = 'Username must be at most 30 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
      errors.username = 'Username may only contain letters, numbers, and underscores';
    }

    if (!form.password) {
      errors.password = 'Password is required';
    } else if (form.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (!form.confirm) {
      errors.confirm = 'Please confirm your password';
    } else if (form.password !== form.confirm) {
      errors.confirm = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!validateInputs()) {
      toast.warning('Please check form fields and correct errors', 'Validation Failed');
      return;
    }

    setLoad(true);
    try {
      const trimmedUsername = form.username.trim().toLowerCase();
      await register(trimmedUsername, form.password);
      toast.success(
        `Account created successfully! Welcome to Walasmulla Planner, ${trimmedUsername}!`,
        'Account Ready'
      );
      navigate('/my-plans');
    } catch (err) {
      setError(err.message || 'Registration failed');
      toast.error(err.message || 'Registration failed', 'Error');
    } finally {
      setLoad(false);
    }
  }

  // Real-time helper calculations
  const passwordsMatch = form.confirm && form.password === form.confirm;
  const isPasswordValid = form.password.length >= 8;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="card p-8 w-full max-w-sm shadow-2xl border-white/10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary-900/60 border border-primary-700/60 flex items-center justify-center mx-auto mb-4 text-teal-400">
            <UserPlus size={22} />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 mb-1">Create account</h1>
          <p className="text-slate-400 text-sm">Join to save your day tour plans</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Username Input */}
          <div>
            <label className="label" htmlFor="reg-username">
              Username <span className="text-red-400">*</span>
            </label>
            <input
              id="reg-username"
              type="text"
              autoComplete="username"
              placeholder="e.g. tourist_john"
              className={`input ${validationErrors.username ? 'border-red-500/80 focus:border-red-500' : ''}`}
              value={form.username}
              onChange={(e) => {
                setForm((f) => ({ ...f, username: e.target.value }));
                if (validationErrors.username) {
                  setValidationErrors((prev) => ({ ...prev, username: null }));
                }
              }}
              required
            />
            {validationErrors.username ? (
              <p className="form-error text-xs text-red-400 mt-1 flex items-center gap-1">
                <X size={12} /> {validationErrors.username}
              </p>
            ) : (
              <p className="text-[11px] text-slate-500 mt-1">3–30 chars (letters, digits, underscore)</p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label className="label" htmlFor="reg-password">
              Password <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                className={`input pr-10 ${validationErrors.password ? 'border-red-500/80 focus:border-red-500' : ''}`}
                value={form.password}
                onChange={(e) => {
                  setForm((f) => ({ ...f, password: e.target.value }));
                  if (validationErrors.password) {
                    setValidationErrors((prev) => ({ ...prev, password: null }));
                  }
                }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                data-tooltip={showPassword ? 'Hide password' : 'Show password'}
                data-tooltip-pos="left"
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {validationErrors.password ? (
              <p className="form-error text-xs text-red-400 mt-1 flex items-center gap-1">
                <X size={12} /> {validationErrors.password}
              </p>
            ) : form.password ? (
              <p className={`text-[11px] mt-1 flex items-center gap-1 ${isPasswordValid ? 'text-teal-400' : 'text-slate-400'}`}>
                {isPasswordValid ? <Check size={12} /> : null} Minimum 8 characters required
              </p>
            ) : null}
          </div>

          {/* Confirm Password Input */}
          <div>
            <label className="label" htmlFor="reg-confirm">
              Confirm Password <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                id="reg-confirm"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Re-enter your password"
                className={`input pr-10 ${
                  validationErrors.confirm
                    ? 'border-red-500/80 focus:border-red-500'
                    : passwordsMatch
                    ? 'border-teal-500/80'
                    : ''
                }`}
                value={form.confirm}
                onChange={(e) => {
                  setForm((f) => ({ ...f, confirm: e.target.value }));
                  if (validationErrors.confirm) {
                    setValidationErrors((prev) => ({ ...prev, confirm: null }));
                  }
                }}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm((prev) => !prev)}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
                data-tooltip={showConfirm ? 'Hide password' : 'Show password'}
                data-tooltip-pos="left"
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {validationErrors.confirm ? (
              <p className="form-error text-xs text-red-400 mt-1 flex items-center gap-1">
                <X size={12} /> {validationErrors.confirm}
              </p>
            ) : passwordsMatch ? (
              <p className="text-[11px] text-teal-400 mt-1 flex items-center gap-1 font-medium">
                <Check size={12} /> Passwords match
              </p>
            ) : null}
          </div>

          {error && <p className="form-error text-xs">{error}</p>}

          <button
            type="submit"
            disabled={load}
            className="btn-primary w-full flex items-center justify-center gap-2 shadow-glow"
          >
            {load ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
            Create Account
          </button>
        </form>

        <p className="text-center text-slate-400 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-teal-400 hover:text-teal-300 font-medium">Sign in →</Link>
        </p>
      </div>
    </div>
  );
}
