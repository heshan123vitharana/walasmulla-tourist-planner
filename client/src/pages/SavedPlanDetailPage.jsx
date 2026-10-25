/**
 * SavedPlanDetailPage.jsx — View a single saved plan with computed itinerary.
 */
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Loader2, Printer } from 'lucide-react';
import { getSavedPlan } from '../api/api';
import ItineraryList from '../components/ItineraryList';
import PlaceMap from '../components/PlaceMap';

export default function SavedPlanDetailPage() {
  const { id }                = useParams();
  const [plan,    setPlan]    = useState(null);
  const [loading, setLoad]    = useState(true);
  const [error,   setError]   = useState(null);
  const [slowLoading, setSlow] = useState(false);

  const loadPlan = () => {
    setLoad(true);
    setError(null);
    getSavedPlan(id)
      .then(setPlan)
      .catch((e) => setError(e.message))
      .finally(() => setLoad(false));
  };

  useEffect(() => {
    loadPlan();
  }, [id]);

  useEffect(() => {
    let timer;
    if (loading) {
      timer = setTimeout(() => setSlow(true), 3500);
    } else {
      setSlow(false);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <Loader2 size={36} className="text-primary-400 animate-spin mb-3" />
        <p className="text-slate-200 text-sm font-medium">Loading itinerary...</p>
        {slowLoading && (
          <p className="text-slate-400 text-xs mt-2 max-w-xs animate-pulse">
            Cloud server is waking up from sleep mode (Render free tier). Please hold on...
          </p>
        )}
      </div>
    );
  }

  if (error || !plan) return (
    <div className="page-container text-center py-24">
      <div className="card p-8 max-w-md mx-auto border-red-900/40 bg-red-950/20">
        <p className="text-sm text-red-300 mb-5">{error || 'Plan not found.'}</p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={loadPlan} className="btn-primary text-xs px-4 py-2">
            Try Again
          </button>
          <Link to="/my-plans" className="btn-secondary text-xs px-4 py-2">
            Back to my plans
          </Link>
        </div>
      </div>
    </div>
  );

  const stops    = plan.computedStops ?? [];
  const warnings = plan.warnings      ?? [];

  return (
    <div className="page-container max-w-3xl">
      <div className="flex items-center justify-between mb-6 no-print">
        <Link
          to="/my-plans"
          data-tooltip="Return to your saved plans list"
          className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-200 text-sm transition-colors"
        >
          <ChevronLeft size={16} /> My Plans
        </Link>
        <button
          onClick={() => window.print()}
          className="btn-secondary text-sm px-3.5 py-1.5 flex items-center gap-2"
          data-tooltip="Print itinerary or save to PDF"
          title="Print itinerary or save as PDF"
        >
          <Printer size={15} /> Print / PDF
        </button>
      </div>

      <div className="print-only mb-6 pb-4 border-b border-slate-300">
        <h1 className="text-2xl font-bold text-slate-900">Walasmulla Tourist Day Plan</h1>
        <p className="text-sm text-slate-600">Plan: {plan.title}</p>
        <p className="text-xs text-slate-500 mt-1">Start: {plan.startTime} · {stops.length} stops</p>
      </div>

      <h1 className="text-gradient text-3xl font-bold mb-1 no-print">{plan.title}</h1>
      <p className="text-slate-400 text-sm mb-8 no-print">
        Start: {plan.startTime} · {stops.length} stops · Created {new Date(plan.createdAt).toLocaleDateString()}
      </p>

      {stops.length > 0 && (
        <div className="card overflow-hidden mb-6 no-print">
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
