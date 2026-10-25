/**
 * DayPlannerPage.jsx — Build and generate a day itinerary.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, Loader2, X, RefreshCw, Save, ArrowUp, ArrowDown, Clock, Printer,
} from 'lucide-react';
import { usePlan } from '../context/PlanContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { generatePlan, savePlan } from '../api/api';
import ItineraryList from '../components/ItineraryList';
import PlaceMap from '../components/PlaceMap';

export default function DayPlannerPage() {
  const { placeIds, places, startTime, orderMode, removePlace, movePlace, setStart, setMode, clearPlan } = usePlan();
  const { user } = useAuth();
  const toast = useToast();

  const [result,    setResult]    = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [saveLoading, setSave]    = useState(false);
  const [error,     setError]     = useState(null);
  const [saved,     setSaved]     = useState(false);

  async function handleGenerate() {
    if (placeIds.length === 0) {
      toast.warning('Please add at least one destination to generate a plan.', 'No Places Selected');
      return;
    }
    setLoading(true);
    setError(null);
    setSaved(false);

    const opts = { placeIds, startTime, orderMode };
    if (orderMode === 'manual') opts.manualOrder = placeIds;

    try {
      const res = await generatePlan(opts);
      setResult(res);
      toast.success(`Itinerary with ${res.stops?.length || placeIds.length} stops generated successfully!`, 'Itinerary Ready');
    } catch (e) {
      setError(e.message);
      toast.error(e.message || 'Failed to generate itinerary', 'Error');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!result || !user) return;
    setSave(true);
    try {
      await savePlan({ placeIds, startTime, orderMode });
      setSaved(true);
      toast.success('Your itinerary has been saved to "My Plans"!', 'Plan Saved');
    } catch (e) {
      setError(e.message);
      toast.error(e.message || 'Failed to save plan', 'Save Error');
    } finally {
      setSave(false);
    }
  }

  function handleClearAll() {
    clearPlan();
    setResult(null);
    toast.info('All stops have been cleared from your day plan.', 'Plan Cleared');
  }

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="text-gradient mb-1">Day Planner</h1>
        <p className="text-slate-400">Add places from the directory, then generate your itinerary.</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_420px] gap-8">
        {/* Left — config */}
        <div className="space-y-6">
          {/* Options */}
          <div className="card p-5 flex flex-wrap gap-5">
            <div>
              <label className="label" htmlFor="start-time"><Clock size={13} className="inline mr-1" /> Start Time</label>
              <input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStart(e.target.value)}
                className="input w-36"
              />
            </div>
            <div>
              <label className="label">Ordering</label>
              <div className="flex gap-2">
                {['auto', 'manual'].map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={orderMode === m ? 'chip-active' : 'chip-inactive'}
                  >
                    {m === 'auto' ? '🔀 Auto' : '✏️ Manual'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Stops list */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title mb-0">Selected Places ({placeIds.length}/20)</h2>
              {placeIds.length > 0 && (
                <button
                  onClick={handleClearAll}
                  data-tooltip="Remove all selected stops"
                  className="btn-ghost text-xs text-red-400 hover:text-red-300"
                >
                  Clear all
                </button>
              )}
            </div>

            {placeIds.length === 0 ? (
              <div className="text-slate-500 text-sm py-6 text-center">
                No places added yet. <Link to="/places" className="text-primary-400">Browse the directory →</Link>
              </div>
            ) : (
              <ul className="space-y-2">
                {places.map((p, i) => (
                  <li key={p._id} className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-surface-border">
                    <span className="text-xs font-bold text-primary-400 w-5 text-center">{i + 1}</span>
                    <span className="flex-1 text-sm text-slate-200 truncate">{p.name}</span>
                    {orderMode === 'manual' && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => movePlace(i, i - 1)}
                          disabled={i === 0}
                          data-tooltip="Move stop up"
                          className="btn-ghost p-1 text-slate-500 disabled:opacity-20"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          onClick={() => movePlace(i, i + 1)}
                          disabled={i === places.length - 1}
                          data-tooltip="Move stop down"
                          className="btn-ghost p-1 text-slate-500 disabled:opacity-20"
                        >
                          <ArrowDown size={13} />
                        </button>
                      </div>
                    )}
                    <button
                      onClick={() => removePlace(p._id)}
                      data-tooltip="Remove from plan"
                      className="btn-ghost p-1 text-slate-500 hover:text-red-400"
                    >
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 no-print">
            <button
              onClick={handleGenerate}
              disabled={placeIds.length === 0 || loading}
              data-tooltip="Compute optimal route and timings"
              className="btn-primary flex-1"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              Generate Itinerary
            </button>
            {result && (
              <button
                type="button"
                onClick={() => window.print()}
                className="btn-secondary flex items-center gap-2"
                data-tooltip="Print itinerary or save as PDF"
                title="Print itinerary or save to PDF"
              >
                <Printer size={16} /> Print / PDF
              </button>
            )}
            {result && user && (
              <button
                onClick={handleSave}
                disabled={saveLoading || saved}
                data-tooltip="Save plan to your account"
                className="btn-secondary"
              >
                {saveLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saved ? 'Saved!' : 'Save Plan'}
              </button>
            )}
            {result && !user && (
              <Link to="/login" className="btn-secondary">
                <Save size={16} /> Sign in to save
              </Link>
            )}
          </div>

          {error && <p className="form-error no-print">{error}</p>}
        </div>

        {/* Right — itinerary + map */}
        <div className="space-y-6">
          {result && (
            <>
              {result.stops.length > 0 && (
                <div className="card overflow-hidden no-print">
                  <PlaceMap stops={result.stops} height="260px" />
                </div>
              )}
              <div className="card p-5">
                <div className="print-only mb-4 pb-3 border-b border-slate-300">
                  <h1 className="text-xl font-bold text-slate-900">Walasmulla Tourist Day Plan</h1>
                  <p className="text-xs text-slate-600">Start Time: {startTime} · {result.stops.length} Stops · Southern Sri Lanka</p>
                </div>
                <div className="flex items-center justify-between mb-4 no-print">
                  <h2 className="section-title mb-0">Your Itinerary</h2>
                  <button
                    onClick={() => window.print()}
                    className="text-xs text-slate-400 hover:text-teal-300 flex items-center gap-1.5 transition-colors"
                  >
                    <Printer size={13} /> Print / Save PDF
                  </button>
                </div>
                <ItineraryList stops={result.stops} warnings={result.warnings} />
              </div>
            </>
          )}
          {!result && (
            <div className="card p-8 text-center text-slate-500">
              <Calendar size={40} className="mx-auto mb-3 text-primary-800" />
              <p className="text-sm">Add places on the left and click<br /><strong>Generate Itinerary</strong> to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
