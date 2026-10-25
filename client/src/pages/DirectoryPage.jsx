/**
 * DirectoryPage.jsx — Browse / search / filter all places with Distance and Duration filters.
 */
import React, { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal, Loader2, MapPin, Clock, ArrowUpDown, RotateCcw } from 'lucide-react';
import { getCategories, getPlaces } from '../api/api';
import PlaceCard from '../components/PlaceCard';

const DISTANCE_OPTIONS = [
  { label: 'All Distances', value: 'all' },
  { label: '< 15 km', value: 15 },
  { label: '< 20 km', value: 20 },
  { label: '< 25 km', value: 25 },
];

const DURATION_OPTIONS = [
  { label: 'All Durations', value: 'all' },
  { label: '≤ 45 min', value: 45 },
  { label: '≤ 60 min', value: 60 },
  { label: '> 60 min', value: 'long' },
];

export default function DirectoryPage() {
  const [categories,    setCategories]    = useState([]);
  const [rawPlaces,     setRawPlaces]     = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [query,         setQuery]         = useState('');
  const [activeCats,    setActiveCats]    = useState([]);
  const [maxDistance,   setMaxDistance]   = useState('all');
  const [maxDuration,   setMaxDuration]   = useState('all');
  const [sortBy,        setSortBy]        = useState('default');
  const [retryTrigger,  setRetryTrigger]  = useState(0);

  /* Load categories once */
  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, [retryTrigger]);

  /* Reload places from API when search query or categories change */
  useEffect(() => {
    const params = {};
    if (query)              params.q        = query;
    if (activeCats.length)  params.category = activeCats.join(',');

    setLoading(true);
    setError(null);

    const timer = setTimeout(() => {
      getPlaces(params)
        .then(setRawPlaces)
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }, 300); // debounce

    return () => clearTimeout(timer);
  }, [query, activeCats, retryTrigger]);

  function toggleCat(slug) {
    setActiveCats((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }

  function handleResetFilters() {
    setQuery('');
    setActiveCats([]);
    setMaxDistance('all');
    setMaxDuration('all');
    setSortBy('default');
  }

  const isFiltered = query || activeCats.length > 0 || maxDistance !== 'all' || maxDuration !== 'all' || sortBy !== 'default';

  /* Apply Client-Side Distance, Duration, and Sorting filters */
  const filteredPlaces = useMemo(() => {
    let result = [...rawPlaces];

    // Distance Filter
    if (maxDistance !== 'all') {
      const maxKm = Number(maxDistance);
      result = result.filter((p) => p.distanceKm !== undefined && p.distanceKm <= maxKm);
    }

    // Duration Filter
    if (maxDuration === 'long') {
      result = result.filter((p) => p.visitDurationMinutes > 60);
    } else if (maxDuration !== 'all') {
      const maxMin = Number(maxDuration);
      result = result.filter((p) => p.visitDurationMinutes <= maxMin);
    }

    // Sorting
    if (sortBy === 'distance-asc') {
      result.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
    } else if (sortBy === 'duration-asc') {
      result.sort((a, b) => (a.visitDurationMinutes ?? 0) - (b.visitDurationMinutes ?? 0));
    } else if (sortBy === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [rawPlaces, maxDistance, maxDuration, sortBy]);

  return (
    <div className="page-container">
      <div className="mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-950/80 border border-primary-800/40 text-primary-300 text-xs font-semibold">
          <MapPin size={12} className="text-teal-400" />
          <span>Walasmulla Hub & Surrounding Southern Province</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
          Explore <span className="text-gradient">Places</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base">
          Browse verified heritage cave temples, sandy beaches, wildlife reserves and waterfalls.
        </p>
      </div>

      {/* Top Search & Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
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

        {/* Sort Select */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 flex items-center gap-1 shrink-0">
            <ArrowUpDown size={13} /> Sort:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-surface-card border border-surface-border text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-teal-500"
          >
            <option value="default">Default Order</option>
            <option value="distance-asc">Nearest Distance First</option>
            <option value="duration-asc">Shortest Visit Duration</option>
            <option value="name-asc">Alphabetical (A to Z)</option>
          </select>
        </div>
      </div>

      {/* Category Chips */}
      {categories.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="flex items-center gap-1 text-slate-400 text-xs font-semibold uppercase tracking-wider mr-1">
            <SlidersHorizontal size={13} /> Categories:
          </span>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => toggleCat(cat.slug)}
              className={activeCats.includes(cat.slug) ? 'chip-active text-xs' : 'chip-inactive text-xs'}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Distance & Duration Filter Bars */}
      <div className="p-3.5 rounded-2xl bg-surface-card/50 border border-surface-border/70 mb-6 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 text-slate-400 text-xs font-semibold uppercase tracking-wider mr-1">
            <MapPin size={13} className="text-teal-400" /> Max Distance:
          </span>
          {DISTANCE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setMaxDistance(opt.value)}
              className={`px-3 py-1 rounded-xl text-xs font-medium border transition-all ${
                maxDistance === opt.value
                  ? 'bg-teal-950/80 border-teal-500/80 text-teal-300 font-semibold shadow-[0_0_10px_rgba(20,184,166,0.2)]'
                  : 'bg-surface-card/60 border-surface-border text-slate-400 hover:text-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-surface-border/40">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 text-slate-400 text-xs font-semibold uppercase tracking-wider mr-1">
              <Clock size={13} className="text-teal-400" /> Visit Duration:
            </span>
            {DURATION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setMaxDuration(opt.value)}
                className={`px-3 py-1 rounded-xl text-xs font-medium border transition-all ${
                  maxDuration === opt.value
                    ? 'bg-teal-950/80 border-teal-500/80 text-teal-300 font-semibold shadow-[0_0_10px_rgba(20,184,166,0.2)]'
                    : 'bg-surface-card/60 border-surface-border text-slate-400 hover:text-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Reset Filters Link */}
          {isFiltered && (
            <button
              onClick={handleResetFilters}
              data-tooltip="Reset search queries and active filters"
              className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors ml-auto"
            >
              <RotateCcw size={12} /> Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* Results Header */}
      {!loading && !error && (
        <div className="flex items-center justify-between text-xs text-slate-400 mb-4 px-1">
          <span>
            Showing <strong className="text-slate-200">{filteredPlaces.length}</strong> of{' '}
            <strong className="text-slate-200">{rawPlaces.length}</strong> destinations
          </span>
        </div>
      )}

      {/* Results Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={32} className="text-primary-400 animate-spin" />
        </div>
      ) : error ? (
        <div className="card p-8 text-center max-w-md mx-auto my-8 border-red-900/40 bg-red-950/20">
          <p className="text-sm text-red-300 mb-4">{error}</p>
          <button
            onClick={() => setRetryTrigger((c) => c + 1)}
            data-tooltip="Retry connecting to server"
            className="btn-primary text-xs px-4 py-2 inline-flex items-center gap-1.5 mx-auto"
          >
            <RotateCcw size={13} /> Try Again
          </button>
        </div>
      ) : filteredPlaces.length === 0 ? (
        <div className="text-slate-400 text-center py-16 card p-8">
          <p className="text-3xl mb-3">🔍</p>
          <p className="font-semibold text-slate-200 mb-1">No destinations match the selected criteria</p>
          <p className="text-xs text-slate-500 mb-4">Try clearing distance or category filters.</p>
          <button onClick={handleResetFilters} className="btn-secondary text-xs px-4 py-2 mx-auto">
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredPlaces.map((p) => <PlaceCard key={p._id} place={p} />)}
        </div>
      )}
    </div>
  );
}

