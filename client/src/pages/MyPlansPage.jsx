/**
 * MyPlansPage.jsx — Tourist saved plans list.
 */
import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Loader2, Trash2, ChevronRight, PlusCircle, RotateCcw, AlertCircle } from 'lucide-react';
import { getMyPlans, deletePlan } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function MyPlansPage() {
  const { user }              = useAuth();
  const toast                 = useToast();
  const [plans, setPlans]     = useState([]);
  const [loading, setLoad]    = useState(true);
  const [slowLoading, setSlow] = useState(false);
  const [error, setError]     = useState(null);

  const loadPlans = useCallback(() => {
    setLoad(true);
    setError(null);
    getMyPlans()
      .then(setPlans)
      .catch((e) => setError(e.message))
      .finally(() => setLoad(false));
  }, []);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  // Show helpful hint if cold-start takes more than 3 seconds
  useEffect(() => {
    let timer;
    if (loading) {
      timer = setTimeout(() => setSlow(true), 3500);
    } else {
      setSlow(false);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  async function handleDelete(id, title) {
    if (!confirm(`Delete plan "${title || 'this plan'}"?`)) return;
    try {
      await deletePlan(id);
      setPlans((prev) => prev.filter((p) => p._id !== id));
      toast.success(`Plan "${title || 'Itinerary'}" was deleted`, 'Plan Removed');
    } catch (e) {
      toast.error(e.message || 'Failed to delete plan', 'Error');
    }
  }

  return (
    <div className="page-container max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-gradient mb-1">My Plans</h1>
          <p className="text-slate-400">Welcome back, <strong className="text-slate-300">{user?.username}</strong></p>
        </div>
        <Link to="/planner" className="btn-primary">
          <PlusCircle size={16} /> New Plan
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Loader2 size={36} className="text-primary-400 animate-spin mb-3" />
          <p className="text-slate-200 text-sm font-medium">Loading your saved plans...</p>
          {slowLoading && (
            <p className="text-slate-400 text-xs mt-2 max-w-xs animate-pulse leading-relaxed">
              Cloud server is waking up from sleep mode (Render free tier). Please hold on...
            </p>
          )}
        </div>
      ) : error ? (
        <div className="card p-8 text-center max-w-md mx-auto my-8 border-red-900/40 bg-red-950/20">
          <AlertCircle size={36} className="mx-auto mb-3 text-red-400" />
          <h3 className="text-base font-semibold text-slate-100 mb-1">Unable to Load Plans</h3>
          <p className="text-xs text-red-300/90 mb-5 leading-relaxed">{error}</p>
          <button
            onClick={loadPlans}
            data-tooltip="Retry connecting to the server"
            className="btn-primary text-xs px-5 py-2.5 inline-flex items-center gap-2 mx-auto"
          >
            <RotateCcw size={14} /> Retry Now
          </button>
        </div>
      ) : plans.length === 0 ? (
        <div className="card p-12 text-center text-slate-500">
          <Calendar size={40} className="mx-auto mb-3 text-primary-800" />
          <p className="mb-4">You haven't saved any plans yet.</p>
          <Link to="/planner" className="btn-primary">Create your first plan</Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {plans.map((plan) => (
            <li key={plan._id} className="card p-5 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-100 truncate">{plan.title}</p>
                <p className="text-slate-400 text-xs mt-0.5">
                  {plan.stops?.length ?? 0} stops · Start {plan.startTime} · {new Date(plan.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Link
                to={`/plans/${plan._id}`}
                data-tooltip="View detailed itinerary & map"
                className="btn-secondary shrink-0 text-sm"
              >
                View <ChevronRight size={14} />
              </Link>
              <button
                onClick={() => handleDelete(plan._id, plan.title)}
                data-tooltip="Delete saved plan"
                className="btn-ghost p-2 text-red-400 hover:text-red-300"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
