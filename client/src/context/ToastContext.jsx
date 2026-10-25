/**
 * ToastContext.jsx — Global toast notification system with glassmorphic styling and micro-animations.
 */
import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ type = 'info', message, title, duration = 3800 }) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 7);
    const newToast = { id, type, message, title, duration };

    setToasts((prev) => [...prev.slice(-4), newToast]); // keep max 5 toasts

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, [removeToast]);

  const toast = {
    success: (message, title = 'Success') => addToast({ type: 'success', message, title }),
    error:   (message, title = 'Error')   => addToast({ type: 'error', message, title }),
    warning: (message, title = 'Warning') => addToast({ type: 'warning', message, title }),
    info:    (message, title = 'Notice')  => addToast({ type: 'info', message, title }),
    dismiss: removeToast,
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      success: () => {},
      error:   () => {},
      warning: () => {},
      info:    () => {},
      dismiss: () => {},
    };
  }
  return ctx;
}

/* ─── Toast Container & Item Components ────────────────────────── */
function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none p-2 sm:p-0"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }) {
  const { type, message, title, duration } = toast;

  const config = {
    success: {
      icon: <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />,
      border: 'border-emerald-500/40',
      bg: 'bg-[#061410]/95',
      glow: 'shadow-[0_4px_25px_rgba(16,185,129,0.25)]',
      bar: 'bg-emerald-400',
      titleColor: 'text-emerald-300',
    },
    error: {
      icon: <AlertCircle size={18} className="text-rose-400 shrink-0 mt-0.5" />,
      border: 'border-rose-500/40',
      bg: 'bg-[#180a0e]/95',
      glow: 'shadow-[0_4px_25px_rgba(244,63,94,0.25)]',
      bar: 'bg-rose-500',
      titleColor: 'text-rose-300',
    },
    warning: {
      icon: <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />,
      border: 'border-amber-500/40',
      bg: 'bg-[#181105]/95',
      glow: 'shadow-[0_4px_25px_rgba(245,158,11,0.25)]',
      bar: 'bg-amber-400',
      titleColor: 'text-amber-300',
    },
    info: {
      icon: <Info size={18} className="text-teal-400 shrink-0 mt-0.5" />,
      border: 'border-teal-500/40',
      bg: 'bg-[#051114]/95',
      glow: 'shadow-[0_4px_25px_rgba(20,184,166,0.25)]',
      bar: 'bg-teal-400',
      titleColor: 'text-teal-300',
    },
  }[type] || {
    icon: <Info size={18} className="text-slate-400 shrink-0 mt-0.5" />,
    border: 'border-slate-700',
    bg: 'bg-slate-900/95',
    glow: 'shadow-lg',
    bar: 'bg-slate-400',
    titleColor: 'text-slate-200',
  };

  return (
    <div
      role="alert"
      className={`pointer-events-auto relative overflow-hidden rounded-2xl border ${config.border} ${config.bg} ${config.glow} backdrop-blur-2xl p-4 transition-all duration-300 animate-in slide-in-from-top-3 fade-in`}
    >
      <div className="flex items-start gap-3">
        {config.icon}
        <div className="flex-1 min-w-0 pr-2">
          {title && <h4 className={`text-xs font-bold uppercase tracking-wider ${config.titleColor}`}>{title}</h4>}
          <p className="text-xs sm:text-sm text-slate-200 mt-0.5 leading-snug break-words">{message}</p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0"
          aria-label="Dismiss notification"
        >
          <X size={14} />
        </button>
      </div>

      {/* Animated time remaining indicator bar */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10 overflow-hidden">
          <div
            className={`h-full ${config.bar} animate-toast-progress`}
            style={{ animationDuration: `${duration}ms` }}
          />
        </div>
      )}
    </div>
  );
}
