/**
 * SavedPlanDetailPage.jsx — View a single saved plan with computed itinerary.
 */
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { getSavedPlan } from '../api/api';
import ItineraryList from '../components/ItineraryList';
import PlaceMap from '../components/PlaceMap';

export default function SavedPlanDetailPage() {
  const { id }                = useParams();
  const [plan,    setPlan]    = useState(null);
  const [loading, setLoad]    = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    getSavedPlan(id)
      .then(setPlan)
      .catch((e) => setError(e.message))
      .finally(() => setLoad(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-32"><Loader2 size={32} className="text-primary-400 animate-spin" /></div>;

  if (error || !plan) return (
    <div className="page-container text-center py-24 text-red-400">
      {error || 'Plan not found.'}
      <br />
      <Link to="/my-plans" className="btn-secondary mt-4">Back to my plans</Link>
    </div>
  );

  const stops    = plan.computedStops ?? [];
  const warnings = plan.warnings      ?? [];

  return (
    <div className="page-container max-w-3xl">
      <Link to="/my-plans" className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-200 text-sm mb-6 transition-colors">
        <ChevronLeft size={16} /> My Plans
      </Link>

      <h1 className="text-gradient text-3xl font-bold mb-1">{plan.title}</h1>
      <p className="text-slate-400 text-sm mb-8">
        Start: {plan.startTime} · {stops.length} stops · Created {new Date(plan.createdAt).toLocaleDateString()}
      </p>

      {stops.length > 0 && (
        <div className="card overflow-hidden mb-6">
          <PlaceMap stops={stops} height="280px" />
        </div>
      )}

      <div className="card p-5">
        <h2 className="section-title">Itinerary</h2>
        <ItineraryList stops={stops} warnings={warnings} />
      </div>
    </div>
  );
}
