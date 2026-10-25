/**
 * PlaceModal.jsx — High-polish modal form to Add & Edit Tourist Destinations.
 */
import React, { useState, useEffect } from 'react';
import { X, MapPin, Clock, ShieldCheck, Sparkles, Image as ImageIcon, Loader2, Info } from 'lucide-react';
import { adminCreatePlace, adminUpdatePlace } from '../../api/api';

const WALASMULLA_DEFAULT_COORDS = { lat: 6.1528, lng: 80.6981 };
const TEMPLE_DRESS_CODE_PRESET = 'Modest attire required. Shoulders and knees must be covered; footwear and headwear must be removed before entering shrines.';

export default function PlaceModal({ isOpen, onClose, onSaved, place = null, categories = [] }) {
  const isEditing = Boolean(place && place._id);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCats, setSelectedCats] = useState([]);
  const [lat, setLat] = useState(WALASMULLA_DEFAULT_COORDS.lat);
  const [lng, setLng] = useState(WALASMULLA_DEFAULT_COORDS.lng);
  const [duration, setDuration] = useState(60);
  const [distanceKm, setDistanceKm] = useState('');
  const [opensAt, setOpensAt] = useState('');
  const [closesAt, setClosesAt] = useState('');
  const [openingNotes, setOpeningNotes] = useState('');
  const [entryRequirements, setEntryRequirements] = useState('');
  const [travelTips, setTravelTips] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    if (place) {
      setName(place.name || '');
      setDescription(place.description || '');
      // Place categories can be array of populated objects or string IDs
      const catIds = (place.categories || []).map((c) => (typeof c === 'object' ? c._id : c));
      setSelectedCats(catIds);

      // Coordinates in GeoJSON: [lng, lat]
      if (place.location?.coordinates && place.location.coordinates.length === 2) {
        setLng(place.location.coordinates[0]);
        setLat(place.location.coordinates[1]);
      } else {
        setLat(WALASMULLA_DEFAULT_COORDS.lat);
        setLng(WALASMULLA_DEFAULT_COORDS.lng);
      }

      setDuration(place.visitDurationMinutes || 60);
      setDistanceKm(place.distanceKm !== undefined && place.distanceKm !== null ? place.distanceKm : '');
      setOpensAt(place.openingHours?.opensAt || '');
      setClosesAt(place.openingHours?.closesAt || '');
      setOpeningNotes(place.openingHours?.notes || '');
      setEntryRequirements(place.entryRequirements || '');
      setTravelTips(Array.isArray(place.travelTips) ? place.travelTips.join('\n') : '');
      setImageUrl(place.imageUrl || '');
      setIsActive(place.isActive !== undefined ? place.isActive : true);
    } else {
      // Default reset for adding new place
      setName('');
      setDescription('');
      setSelectedCats(categories.length > 0 ? [categories[0]._id] : []);
      setLat(WALASMULLA_DEFAULT_COORDS.lat);
      setLng(WALASMULLA_DEFAULT_COORDS.lng);
      setDuration(60);
      setDistanceKm('');
      setOpensAt('08:00');
      setClosesAt('17:00');
      setOpeningNotes('Open daily');
      setEntryRequirements('');
      setTravelTips('');
      setImageUrl('');
      setIsActive(true);
    }
    setError(null);
  }, [isOpen, place, categories]);

  if (!isOpen) return null;

  function toggleCategory(catId) {
    if (selectedCats.includes(catId)) {
      if (selectedCats.length === 1) {
        setError('A place must have at least one category.');
        return;
      }
      setSelectedCats(selectedCats.filter((id) => id !== catId));
    } else {
      setSelectedCats([...selectedCats, catId]);
    }
    setError(null);
  }

  function handleDressCodePreset() {
    setEntryRequirements(TEMPLE_DRESS_CODE_PRESET);
  }

  function handleSetWalasmullaCentre() {
    setLat(WALASMULLA_DEFAULT_COORDS.lat);
    setLng(WALASMULLA_DEFAULT_COORDS.lng);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    // Validation
    if (!name.trim()) {
      setError('Place name is required.');
      return;
    }
    if (selectedCats.length === 0) {
      setError('Please select at least one category.');
      return;
    }
    if (!description.trim()) {
      setError('Description is required.');
      return;
    }
    const numLat = parseFloat(lat);
    const numLng = parseFloat(lng);
    if (isNaN(numLat) || isNaN(numLng) || numLat < -90 || numLat > 90 || numLng < -180 || numLng > 180) {
      setError('Please provide valid geographical coordinates (Latitude between -90 and 90, Longitude between -180 and 180).');
      return;
    }
    const numDuration = parseInt(duration, 10);
    if (isNaN(numDuration) || numDuration < 5 || numDuration > 480) {
      setError('Visit duration must be between 5 and 480 minutes (8 hours).');
      return;
    }

    const payload = {
      name: name.trim(),
      categories: selectedCats,
      description: description.trim(),
      visitDurationMinutes: numDuration,
      location: {
        type: 'Point',
        coordinates: [numLng, numLat], // GeoJSON standard: [lng, lat]
      },
      openingHours: {
        opensAt: opensAt.trim() || null,
        closesAt: closesAt.trim() || null,
        notes: openingNotes.trim() || undefined,
      },
      entryRequirements: entryRequirements.trim() || undefined,
      travelTips: travelTips
        ? travelTips.split('\n').map((t) => t.trim()).filter(Boolean)
        : [],
      imageUrl: imageUrl.trim() || null,
      isActive,
    };

    if (distanceKm !== '' && !isNaN(parseFloat(distanceKm))) {
      payload.distanceKm = parseFloat(distanceKm);
    }

    setSaving(true);
    try {
      if (isEditing) {
        await adminUpdatePlace(place._id, payload);
      } else {
        await adminCreatePlace(payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save place');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#090d16] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-teal-400">
              <MapPin size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {isEditing ? `Edit: ${place.name}` : 'Add New Tourist Destination'}
              </h2>
              <p className="text-xs text-slate-400">
                {isEditing ? 'Update destination details and coordinates' : 'Create a new destination in Walasmulla & Southern Sri Lanka'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-sm flex items-start gap-2">
              <Info size={16} className="shrink-0 mt-0.5 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Place Name & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="label" htmlFor="place-name">
                Place Name <span className="text-red-400">*</span>
              </label>
              <input
                id="place-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Madunagala Hot Springs"
                className="input"
              />
            </div>
            <div>
              <label className="label">Visibility</label>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`w-full py-2.5 px-3 rounded-xl border text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  isActive
                    ? 'bg-green-950/40 border-green-700/50 text-green-300 hover:bg-green-950/60'
                    : 'bg-red-950/40 border-red-800/50 text-red-300 hover:bg-red-950/60'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-400' : 'bg-red-400'}`} />
                {isActive ? 'Active (Visible)' : 'Inactive (Hidden)'}
              </button>
            </div>
          </div>

          {/* Categories Multi-Select */}
          <div>
            <label className="label">
              Categories <span className="text-red-400">*</span>
              <span className="text-xs text-slate-400 font-normal ml-2">(Select at least one)</span>
            </label>
            <div className="flex flex-wrap gap-2 pt-1">
              {categories.map((c) => {
                const isSelected = selectedCats.includes(c._id);
                return (
                  <button
                    key={c._id}
                    type="button"
                    onClick={() => toggleCategory(c._id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'bg-primary-950/90 border-teal-500/70 text-teal-300 shadow-[0_0_10px_rgba(20,184,166,0.2)]'
                        : 'bg-surface-card border-surface-border text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {isSelected && '✓ '}
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="label" htmlFor="place-desc">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              id="place-desc"
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of the destination, attractions, and cultural significance..."
              className="input resize-none"
            />
          </div>

          {/* Coordinates Section with Quick Helper */}
          <div className="p-4 rounded-xl bg-surface-card/60 border border-surface-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                <MapPin size={13} /> Coordinates (GeoJSON Location)
              </span>
              <button
                type="button"
                onClick={handleSetWalasmullaCentre}
                className="text-xs text-slate-400 hover:text-teal-300 underline transition-colors"
              >
                Set to Walasmulla Center (6.1528, 80.6981)
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label" htmlFor="place-lat">Latitude (°N)</label>
                <input
                  id="place-lat"
                  type="number"
                  step="0.0001"
                  required
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  className="input"
                  placeholder="6.1528"
                />
              </div>
              <div>
                <label className="label" htmlFor="place-lng">Longitude (°E)</label>
                <input
                  id="place-lng"
                  type="number"
                  step="0.0001"
                  required
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  className="input"
                  placeholder="80.6981"
                />
              </div>
            </div>
          </div>

          {/* Duration & Distance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="place-duration">
                Visit Duration (minutes) <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="place-duration"
                  type="number"
                  min="5"
                  max="480"
                  step="5"
                  required
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="input pr-14"
                  placeholder="60"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-medium">
                  min
                </span>
              </div>
            </div>
            <div>
              <label className="label" htmlFor="place-dist">
                Distance from Walasmulla (km)
              </label>
              <div className="relative">
                <input
                  id="place-dist"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(e.target.value)}
                  className="input pr-14"
                  placeholder="Auto-calculated"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-medium">
                  km
                </span>
              </div>
            </div>
          </div>

          {/* Opening Hours */}
          <div className="p-4 rounded-xl bg-surface-card/60 border border-surface-border space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
              <Clock size={13} /> Opening Hours (Optional)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="label" htmlFor="opens-at">Opens At</label>
                <input
                  id="opens-at"
                  type="time"
                  value={opensAt}
                  onChange={(e) => setOpensAt(e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label" htmlFor="closes-at">Closes At</label>
                <input
                  id="closes-at"
                  type="time"
                  value={closesAt}
                  onChange={(e) => setClosesAt(e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label" htmlFor="opening-notes">Notes</label>
                <input
                  id="opening-notes"
                  type="text"
                  value={openingNotes}
                  onChange={(e) => setOpeningNotes(e.target.value)}
                  placeholder="e.g. Open daily, Poya days"
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* Entry Requirements & Dress Code */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="label mb-0" htmlFor="entry-req">
                Entry Requirements & Dress Code
              </label>
              <button
                type="button"
                onClick={handleDressCodePreset}
                className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors"
              >
                <ShieldCheck size={12} /> Apply Temple Dress Code
              </button>
            </div>
            <textarea
              id="entry-req"
              rows={2}
              value={entryRequirements}
              onChange={(e) => setEntryRequirements(e.target.value)}
              placeholder="e.g. Modest dress recommended. Footwear must be removed."
              className="input resize-none"
            />
          </div>

          {/* Travel Tips */}
          <div>
            <label className="label" htmlFor="travel-tips">
              Travel Tips (One tip per line)
            </label>
            <textarea
              id="travel-tips"
              rows={2}
              value={travelTips}
              onChange={(e) => setTravelTips(e.target.value)}
              placeholder="e.g. Early morning is the best time for photography.&#10;Bring drinking water and sun protection."
              className="input resize-none"
            />
          </div>

          {/* Image URL with Live Preview */}
          <div>
            <label className="label" htmlFor="image-url">Image URL (Optional)</label>
            <div className="flex gap-2">
              <input
                id="image-url"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="input flex-1"
              />
            </div>
            {imageUrl && (
              <div className="mt-2.5 relative h-28 w-full rounded-xl overflow-hidden border border-surface-border bg-black/40">
                <img
                  src={imageUrl}
                  alt="Destination preview"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-border">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="btn-ghost px-4 py-2 text-sm text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary px-5 py-2 text-sm font-semibold flex items-center gap-2 shadow-glow"
            >
              {saving ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  {isEditing ? 'Save Changes' : 'Create Destination'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
