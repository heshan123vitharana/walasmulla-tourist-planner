/**
 * PlaceDetailPage.jsx — Full detail view for a single place.
 */
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin, Clock, Plus, Check, ChevronLeft, AlertTriangle, Loader2,
  Info, ExternalLink,
} from 'lucide-react';
import { getPlace } from '../api/api';
import { usePlan } from '../context/PlanContext';
import PlaceMap from '../components/PlaceMap';

export default function PlaceDetailPage() {
  const { slugOrId }              = useParams();
  const [place,   setPlace]       = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error,   setError]       = useState(null);
  const { placeIds, addPlace, removePlace } = usePlan();

  useEffect(() => {
    setLoading(true);
    getPlace(slugOrId)
      .then(setPlace)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slugOrId]);

  if (loading) return (
    <div className="flex justify-center py-32">
      <Loader2 size={36} className="text-primary-400 animate-spin" />
    </div>
  );

  if (error || !place) return (
    <div className="page-container text-center py-24 text-red-400">
      <p className="text-5xl mb-4">🗺️</p>
      {error || 'Place not found.'}
      <br />
      <Link to="/places" className="btn-secondary mt-4">Back to directory</Link>
    </div>
  );

  const inPlan       = placeIds.includes(place._id);
  const isDressCode  = place.categories?.some((c) => ['religious', 'heritage'].includes(c.slug));
  const [lng, lat]   = place.location.coordinates;

  return (
    <div className="page-container max-w-4xl">
      {/* Back */}
      <Link to="/places" className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-200 text-sm mb-6 transition-colors">
        <ChevronLeft size={16} /> Back to directory
      </Link>

      {/* Hero image */}
      {place.imageUrl ? (
        <div className="h-64 rounded-2xl overflow-hidden mb-6">
          <img src={place.imageUrl} alt={place.name} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="h-40 rounded-2xl bg-gradient-to-br from-primary-900/40 to-surface flex items-center justify-center mb-6">
          <MapPin size={48} className="text-primary-600/50" />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex flex-wrap gap-1 mb-2">
            {place.categories?.map((c) => (
              <span key={c._id} className="badge-primary">{c.name}</span>
            ))}
          </div>
          <h1 className="text-3xl font-bold text-slate-100">{place.name}</h1>
          <div className="flex items-center gap-4 text-slate-400 text-sm mt-2">
            <span className="flex items-center gap-1"><Clock size={14} /> {place.visitDurationMinutes} min suggested</span>
            {place.distanceKm != null && (
              <span className="flex items-center gap-1"><MapPin size={14} /> {place.distanceKm.toFixed(1)} km from town</span>
            )}
          </div>
        </div>

        <button
          onClick={() => inPlan ? removePlace(place._id) : addPlace(place)}
          className={`shrink-0 ${inPlan ? 'btn-secondary' : 'btn-primary'}`}
        >
          {inPlan ? <><Check size={16} /> In Plan</> : <><Plus size={16} /> Add to Plan</>}
        </button>
      </div>

      {/* Dress code callout */}
      {isDressCode && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-900/30 border border-amber-700/50 text-amber-300 text-sm mb-6">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <div>
            <strong>Dress Code Required</strong> — This is a religious or heritage site. Please cover shoulders and knees; remove footwear where indicated.
          </div>
        </div>
      )}

      {/* Description */}
      <div className="card p-6 mb-6">
        <h2 className="section-title">About This Place</h2>
        <p className="text-slate-300 leading-relaxed whitespace-pre-line">{place.description}</p>
      </div>

      {/* Opening hours + entry requirements */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        {(place.openingHours?.opensAt || place.openingHours?.notes) && (
          <div className="card p-5">
            <h2 className="section-title flex items-center gap-2"><Clock size={16} /> Opening Hours</h2>
            {place.openingHours.opensAt && (
              <p className="text-slate-300 text-sm">{place.openingHours.opensAt} – {place.openingHours.closesAt || '?'}</p>
            )}
            {place.openingHours.notes && (
              <p className="text-slate-400 text-sm mt-1">{place.openingHours.notes}</p>
            )}
          </div>
        )}
        {place.entryRequirements && (
          <div className="card p-5">
            <h2 className="section-title flex items-center gap-2"><Info size={16} /> Entry Requirements</h2>
            <p className="text-slate-300 text-sm">{place.entryRequirements}</p>
          </div>
        )}
      </div>

      {/* Travel tips */}
      {place.travelTips?.length > 0 && (
        <div className="card p-5 mb-6">
          <h2 className="section-title">Travel Tips</h2>
          <ul className="list-disc list-inside text-slate-300 text-sm space-y-1">
            {place.travelTips.map((tip, i) => <li key={i}>{tip}</li>)}
          </ul>
        </div>
      )}

      {/* Map */}
      <div className="card overflow-hidden mb-6">
        <div className="p-4 border-b border-surface-border">
          <h2 className="section-title mb-0">Location</h2>
        </div>
        <PlaceMap place={place} height="300px" />
        <div className="p-3 flex justify-end">
          <a
            href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost text-xs"
          >
            <ExternalLink size={13} /> Open in OpenStreetMap
          </a>
        </div>
      </div>
    </div>
  );
}
