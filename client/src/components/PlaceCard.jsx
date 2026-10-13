/**
 * PlaceCard.jsx — Card shown in the directory grid.
 */
import { Link } from 'react-router-dom';
import { MapPin, Clock, Plus, Check } from 'lucide-react';
import { usePlan } from '../context/PlanContext';

export default function PlaceCard({ place }) {
  const { placeIds, addPlace, removePlace } = usePlan();
  const inPlan = placeIds.includes(place._id);

  function toggle(e) {
    e.preventDefault();
    if (inPlan) removePlace(place._id);
    else addPlace(place);
  }

  return (
    <Link
      to={`/places/${place.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-surface-card/80 border border-surface-border/80 hover:border-primary-500/50 hover:shadow-[0_0_25px_rgba(20,184,166,0.15)] transition-all duration-300 no-underline backdrop-blur-md"
    >
      {/* Image with subtle bottom gradient */}
      <div className="relative h-48 overflow-hidden bg-surface">
        {place.imageUrl ? (
          <img
            src={place.imageUrl}
            alt={place.name}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=800&q=80';
            }}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-900/40 to-surface">
            <MapPin size={40} className="text-primary-600/60" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

        {/* Add to plan button */}
        <button
          onClick={toggle}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
            inPlan
              ? 'bg-primary-500 text-white scale-110 shadow-glow'
              : 'bg-black/60 backdrop-blur-md text-white hover:bg-primary-600 border border-white/20'
          }`}
          title={inPlan ? 'Remove from plan' : 'Add to plan'}
        >
          {inPlan ? <Check size={16} /> : <Plus size={16} />}
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        {/* Categories */}
        <div className="flex flex-wrap gap-1.5">
          {place.categories?.slice(0, 2).map((cat) => (
            <span key={cat._id} className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-primary-950/80 border border-primary-800/50 text-primary-300">
              {cat.name}
            </span>
          ))}
        </div>

        <h3 className="text-slate-100 font-semibold line-clamp-1 group-hover:text-primary-300 transition-colors">
          {place.name}
        </h3>
        <p className="text-slate-400 text-xs sm:text-sm line-clamp-2 flex-1 leading-relaxed">
          {place.description}
        </p>

        <div className="flex items-center justify-between text-slate-400 text-xs mt-auto pt-2 border-t border-surface-border/50">
          <span className="flex items-center gap-1.5">
            <Clock size={12} className="text-primary-400" /> {place.visitDurationMinutes} min
          </span>
          {place.distanceKm != null && (
            <span className="flex items-center gap-1 font-mono text-teal-300 bg-teal-950/70 border border-teal-800/40 px-2 py-0.5 rounded">
              <MapPin size={11} /> {place.distanceKm.toFixed(1)} km
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
