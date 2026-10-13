/**
 * ItineraryList.jsx — Shows computed stops with arrival/departure times.
 */
import { Clock, Navigation, ArrowRight, AlertTriangle } from 'lucide-react';

export default function ItineraryList({ stops = [], warnings = [] }) {
  if (stops.length === 0) {
    return (
      <p className="text-slate-400 text-sm text-center py-8">
        Add places and click <strong>Generate Itinerary</strong> to see your schedule.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {warnings.map((w, i) => (
        <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-amber-900/30 border border-amber-700/50 text-amber-300 text-sm">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          {w}
        </div>
      ))}

      {stops.map((stop, i) => (
        <div key={stop.place._id ?? i} className="card p-4 flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-primary-700 text-white text-sm font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <div>
                <p className="font-semibold text-slate-100 leading-tight">{stop.place.name}</p>
                {stop.place.categories?.length > 0 && (
                  <p className="text-slate-500 text-xs">{stop.place.categories.map(c => c.name).join(' · ')}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-xs text-slate-400 pl-10">
            {i > 0 && (
              <span className="flex items-center gap-1 text-slate-500">
                <Navigation size={12} /> {stop.travelMinutes} min travel
              </span>
            )}
            <span className="flex items-center gap-1">
              <ArrowRight size={12} /> Arrive {stop.arrivalTime}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} /> {stop.visitMinutes} min visit
            </span>
            <span className="flex items-center gap-1">
              <ArrowRight size={12} className="rotate-180" /> Leave {stop.departureTime}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
