/**
 * MyPlansPage.jsx — Tourist saved plans list.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Loader2, Trash2, ChevronRight, PlusCircle } from 'lucide-react';
import { getMyPlans, deletePlan } from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function MyPlansPage() {
  const { user }              = useAuth();
  const [plans, setPlans]     = useState([]);
  const [loading, setLoad]    = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    getMyPlans()
      .then(setPlans)
      .catch((e) => setError(e.message))
      .finally(() => setLoad(false));
  }, []);

  async function handleDelete(id) {
    if (!confirm('Delete this plan?')) return;
    try {
      await deletePlan(id);
      setPlans((prev) => prev.filter((p) => p._id !== id));
    } catch (e) {
      alert(e.message);
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
        <div className="flex justify-center py-20">
          <Loader2 size={32} className="text-primary-400 animate-spin" />
        </div>
      ) : error ? (
        <p className="text-red-400 text-center py-10">{error}</p>
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
              <Link to={`/plans/${plan._id}`} className="btn-secondary shrink-0 text-sm">
                View <ChevronRight size={14} />
              </Link>
              <button onClick={() => handleDelete(plan._id)} className="btn-ghost p-2 text-red-400 hover:text-red-300">
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
