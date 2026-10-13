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
      className="card group flex flex-col overflow-hidden no-underline"
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-surface">
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
        {/* Add to plan button */}
        <button
          onClick={toggle}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
            inPlan
              ? 'bg-primary-500 text-white scale-110'
              : 'bg-black/50 text-white hover:bg-primary-600'
          }`}
          title={inPlan ? 'Remove from plan' : 'Add to plan'}
        >
          {inPlan ? <Check size={16} /> : <Plus size={16} />}
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        {/* Categories */}
        <div className="flex flex-wrap gap-1">
          {place.categories?.slice(0, 2).map((cat) => (
            <span key={cat._id} className="badge-primary text-xs">{cat.name}</span>
          ))}
        </div>

        <h3 className="text-slate-100 font-semibold line-clamp-1">{place.name}</h3>
        <p className="text-slate-400 text-sm line-clamp-2 flex-1">{place.description}</p>

        <div className="flex items-center gap-4 text-slate-500 text-xs mt-auto pt-1">
          <span className="flex items-center gap-1">
            <Clock size={12} /> {place.visitDurationMinutes} min
          </span>
          {place.distanceKm != null && (
            <span className="flex items-center gap-1">
              <MapPin size={12} /> {place.distanceKm.toFixed(1)} km
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
