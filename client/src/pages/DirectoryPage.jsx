/**
 * DirectoryPage.jsx — Browse / search / filter all places.
 */
import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Loader2 } from 'lucide-react';
import { getCategories, getPlaces } from '../api/api';
import PlaceCard from '../components/PlaceCard';

export default function DirectoryPage() {
  const [categories,  setCategories]  = useState([]);
  const [places,      setPlaces]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [query,       setQuery]       = useState('');
  const [activeCats,  setActiveCats]  = useState([]);

  /* Load categories once */
  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  /* Reload places when filters change */
  useEffect(() => {
    const params = {};
    if (query)              params.q        = query;
    if (activeCats.length)  params.category = activeCats.join(',');

    setLoading(true);
    setError(null);

    const timer = setTimeout(() => {
      getPlaces(params)
        .then(setPlaces)
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }, 300); // debounce

    return () => clearTimeout(timer);
  }, [query, activeCats]);

  function toggleCat(slug) {
    setActiveCats((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }

  return (
    <div className="page-container">
      <div className="mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-950/80 border border-primary-800/40 text-primary-300 text-xs font-semibold">
          <span>📍 25 km Radius from Walasmulla Clock Tower</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
          Explore <span className="text-gradient">Places</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base">
          Browse verified heritage cave temples, sandy beaches, wildlife reserves and waterfalls.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4 max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-400" />
        <input
          id="place-search"
          type="search"
          placeholder="Search by name, cave, beach, sanctuary..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input pl-10 pr-4 py-2.5 bg-surface-card/80 border-surface-border/80 focus:border-primary-500 rounded-xl"
        />
      </div>

      {/* Category chips */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="flex items-center gap-1 text-slate-400 text-sm mr-1">
            <SlidersHorizontal size={14} /> Filter:
          </span>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => toggleCat(cat.slug)}
              className={activeCats.includes(cat.slug) ? 'chip-active' : 'chip-inactive'}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={32} className="text-primary-400 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-red-400 text-center py-10">{error}</div>
      ) : places.length === 0 ? (
        <div className="text-slate-400 text-center py-16">
          <p className="text-2xl mb-2">🔍</p>
          No places found. Try adjusting your filters.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {places.map((p) => <PlaceCard key={p._id} place={p} />)}
        </div>
      )}
    </div>
  );
}
