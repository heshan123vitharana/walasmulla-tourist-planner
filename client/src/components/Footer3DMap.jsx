/**
 * Footer3DMap.jsx — Real Map with Animated 3D Tour Vehicle across Walasmulla & Southern Sri Lanka.
 * Features:
 *   - Real interactive Leaflet map (OpenStreetMap / CartoDB / Esri Satellite)
 *   - 10 real geo-located destination markers with popups & tooltips
 *   - 3D-styled animated vehicle smoothly driving along the authentic southern tour circuit
 *   - Golden headlight beam effect rotating along the road direction
 *   - Layer switcher: Dark Mode Map / Real Satellite / Street View
 *   - 3D Isometric Tilt toggle (Perspective view vs Standard Flat map)
 *   - Telemetry HUD showing live nearest spot, speed, distance
 */
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Compass, Eye, Play, Pause, FastForward, Layers,
  MapPin, Sparkles, Navigation, Globe
} from 'lucide-react';

// Real coordinates of tourist spots around Walasmulla (25 km radius)
const REAL_DESTINATIONS = [
  { id: 'walasmulla', name: 'Walasmulla Town Hub', icon: '📍', lat: 6.155, lng: 80.700, distance: '0 km', type: 'Hub', desc: 'Central clock tower junction' },
  { id: 'mulkirigala', name: 'Mulkirigala Rock Temple', icon: '🏛️', lat: 6.126, lng: 80.669, distance: '11 km', type: 'Heritage', desc: 'Ancient rock cave monastery' },
  { id: 'muruthawela', name: 'Muruthawela Reservoir', icon: '💧', lat: 6.210, lng: 80.630, distance: '16 km', type: 'Nature', desc: 'Scenic mountain lake & dam' },
  { id: 'kasagala', name: 'Kasagala Raja Maha Vihara', icon: '⛩️', lat: 6.180, lng: 80.770, distance: '14 km', type: 'Religious', desc: 'Historic temple with ruins' },
  { id: 'ussangoda', name: 'Ussangoda Red Cliffs', icon: '🪨', lat: 6.105, lng: 80.985, distance: '26 km', type: 'Nature', desc: 'Red soil plateau & sea view' },
  { id: 'kalametiya', name: 'Kalametiya Bird Sanctuary', icon: '🪶', lat: 6.085, lng: 80.940, distance: '24 km', type: 'Nature', desc: 'Coastal lagoon & wetland' },
  { id: 'rekawa', name: 'Rekawa Turtle Beach', icon: '🐢', lat: 6.030, lng: 80.838, distance: '22 km', type: 'Nature', desc: 'Sea turtle nesting beach' },
  { id: 'tangalle', name: 'Tangalle Sandy Bay', icon: '🏖️', lat: 6.025, lng: 80.793, distance: '19 km', type: 'Beach', desc: 'Golden palm-fringed coast' },
  { id: 'hummanaya', name: 'Hummanaya Blowhole', icon: '💨', lat: 5.975, lng: 80.730, distance: '24 km', type: 'Nature', desc: 'Natural sea geyser rock' },
  { id: 'wewurukannala', name: 'Wewurukannala Vihara', icon: '🛕', lat: 5.963, lng: 80.705, distance: '22 km', type: 'Cultural', desc: '50m Giant Buddha statue' },
];

// Waypoints tracing realistic roads connecting the spots
const ROAD_CIRCUIT_WAYPOINTS = [
  [6.155, 80.700], // Walasmulla
  [6.168, 80.735],
  [6.180, 80.770], // Kasagala
  [6.165, 80.820],
  [6.135, 80.890],
  [6.115, 80.950],
  [6.105, 80.985], // Ussangoda
  [6.095, 80.960],
  [6.085, 80.940], // Kalametiya
  [6.050, 80.890],
  [6.035, 80.860],
  [6.030, 80.838], // Rekawa
  [6.028, 80.815],
  [6.025, 80.793], // Tangalle
  [6.000, 80.760],
  [5.985, 80.745],
  [5.975, 80.730], // Hummanaya
  [5.968, 80.718],
  [5.963, 80.705], // Wewurukannala
  [5.990, 80.695],
  [6.040, 80.685],
  [6.090, 80.675],
  [6.126, 80.669], // Mulkirigala
  [6.160, 80.650],
  [6.190, 80.638],
  [6.210, 80.630], // Muruthawela
  [6.185, 80.665],
  [6.155, 80.700], // Back to Walasmulla
];

// Densely interpolate points along waypoints for 60fps smooth animation
function generateDensePath(points, segmentsPerLeg = 28) {
  const dense = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    for (let s = 0; s < segmentsPerLeg; s++) {
      const t = s / segmentsPerLeg;
      const lat = p1[0] + (p2[0] - p1[0]) * t;
      const lng = p1[1] + (p2[1] - p1[1]) * t;
      dense.push([lat, lng]);
    }
  }
  return dense;
}

const DENSE_CIRCUIT = generateDensePath(ROAD_CIRCUIT_WAYPOINTS);

// Tile layer providers
const MAP_TILES = {
  dark: {
    name: 'Dark Map',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    className: 'leaflet-dark-tiles',
  },
  satellite: {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, Maxar, Earthstar Geographics',
    className: '',
  },
  street: {
    name: 'Street View',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    className: '',
  },
};

export default function Footer3DMap() {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const carMarkerRef = useRef(null);
  const animFrameRef = useRef(null);

  const [activeTile, setActiveTile] = useState('dark');
  const [is3D, setIs3D] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [nearestSpot, setNearestSpot] = useState(REAL_DESTINATIONS[0]);
  const [currentSpeedKmh, setCurrentSpeedKmh] = useState(42);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Centered around Walasmulla & Southern coastal curve
    const map = L.map(mapContainerRef.current, {
      center: [6.09, 80.81],
      zoom: 11,
      minZoom: 10,
      maxZoom: 16,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
    });
    mapInstanceRef.current = map;

    // Add base tile layer
    const initTile = MAP_TILES[activeTile];
    tileLayerRef.current = L.tileLayer(initTile.url, {
      maxZoom: 19,
      className: initTile.className || '',
    }).addTo(map);

    // Add zoom control in top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Road circuit polyline - glow backdrop & dashed line
    L.polyline(ROAD_CIRCUIT_WAYPOINTS, {
      color: '#0d9488',
      weight: 8,
      opacity: 0.35,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    L.polyline(ROAD_CIRCUIT_WAYPOINTS, {
      color: '#14b8a6',
      weight: 3.5,
      dashArray: '6 8',
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    // Place Markers
    REAL_DESTINATIONS.forEach((dest) => {
      const isHub = dest.id === 'walasmulla';
      const iconHtml = `
        <div style="position:relative;display:flex;align-items:center;justify-content:center;">
          <div style="
            width: ${isHub ? '34px' : '28px'};
            height: ${isHub ? '34px' : '28px'};
            border-radius: ${isHub ? '12px' : '9px'};
            background: ${isHub ? 'linear-gradient(135deg, #0d9488, #14b8a6)' : '#0f172a'};
            border: 2px solid ${isHub ? '#5eead4' : '#14b8a6'};
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${isHub ? '16px' : '13px'};
            box-shadow: 0 4px 12px rgba(0,0,0,0.6), 0 0 10px rgba(20,184,166,0.4);
            cursor: pointer;
            transition: transform 0.2s ease;
          ">
            ${dest.icon}
          </div>
          <div style="
            position: absolute;
            bottom: -18px;
            left: 50%;
            transform: translateX(-50%);
            white-space: nowrap;
            background: rgba(4, 13, 18, 0.92);
            color: #ccfbf1;
            border: 1px solid rgba(20, 184, 166, 0.4);
            font-size: 10px;
            font-weight: 600;
            padding: 1px 6px;
            border-radius: 4px;
            pointer-events: none;
            box-shadow: 0 2px 6px rgba(0,0,0,0.5);
          ">
            ${dest.name.split(' ')[0]}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-map-pin',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([dest.lat, dest.lng], { icon: customIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: inherit; padding: 2px; min-width: 150px; color: #0f172a;">
          <h4 style="font-weight: 700; margin: 0 0 4px 0; color: #0f766e; font-size: 14px;">
            ${dest.icon} ${dest.name}
          </h4>
          <p style="margin: 0 0 4px 0; font-size: 12px; color: #475569;">${dest.desc}</p>
          <div style="font-size: 11px; font-weight: 600; color: #0284c7;">
            📍 Distance from Walasmulla: ${dest.distance}
          </div>
        </div>
      `);
    });

    // 3D Animated Vehicle Marker with Headlights
    const carIconHtml = `
      <div id="footer-car-container" style="
        position: relative;
        width: 36px;
        height: 20px;
        transform-origin: center center;
        transition: transform 0.08s linear;
      ">
        <!-- Glowing Headlight Beam -->
        <div style="
          position: absolute;
          left: 28px;
          top: -14px;
          width: 70px;
          height: 48px;
          background: radial-gradient(ellipse at left, rgba(56, 189, 248, 0.8) 0%, rgba(20, 184, 166, 0.3) 40%, transparent 80%);
          clip-path: polygon(0% 45%, 100% 0%, 100% 100%, 0% 55%);
          filter: drop-shadow(0 0 8px rgba(56, 189, 248, 0.6));
          pointer-events: none;
        "></div>

        <!-- Ground Shadow -->
        <div style="
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.8);
          border-radius: 9999px;
          transform: translateY(2px) scale(0.9);
          filter: blur(2px);
        "></div>

        <!-- 3D Styled Safari Jeep / Tourist SUV -->
        <div style="
          position: relative;
          width: 32px;
          height: 18px;
          background: linear-gradient(90deg, #14b8a6, #0d9488 60%, #042f2e);
          border: 1.5px solid #5eead4;
          border-radius: 5px;
          box-shadow: 0 0 14px #14b8a6, inset 0 1px 2px rgba(255,255,255,0.4);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2px;
        ">
          <!-- Rear red brake lights -->
          <div style="width: 2px; height: 10px; background: #f43f5e; border-radius: 1px; box-shadow: 0 0 6px #f43f5e;"></div>
          
          <!-- Roof / Cab -->
          <div style="width: 14px; height: 10px; background: #0f172a; border: 1px solid rgba(94, 234, 212, 0.6); border-radius: 2px; display: flex; align-items: center; justify-content: center;">
            <div style="width: 8px; height: 4px; background: #38bdf8; border-radius: 1px; opacity: 0.85;"></div>
          </div>

          <!-- Front bright headlights -->
          <div style="width: 2px; height: 10px; background: #fef08a; border-radius: 1px; box-shadow: 0 0 8px #fef08a;"></div>
        </div>
      </div>
    `;

    const carDivIcon = L.divIcon({
      html: carIconHtml,
      className: 'custom-car-marker',
      iconSize: [36, 20],
      iconAnchor: [18, 10],
    });

    carMarkerRef.current = L.marker(DENSE_CIRCUIT[0], {
      icon: carDivIcon,
      zIndexOffset: 1000,
    }).addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update base tile when changed
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    mapInstanceRef.current.removeLayer(tileLayerRef.current);
    const updatedTile = MAP_TILES[activeTile];
    tileLayerRef.current = L.tileLayer(updatedTile.url, {
      maxZoom: 19,
      className: updatedTile.className || '',
    }).addTo(mapInstanceRef.current);
  }, [activeTile]);

  // 60fps Vehicle Animation Loop along Dense Circuit
  useEffect(() => {
    let index = 0;
    let lastTime = performance.now();

    const loop = (currentTime) => {
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (isPlaying && carMarkerRef.current && DENSE_CIRCUIT.length > 0) {
        // Step forward along path based on speed
        const step = delta * 18 * speed;
        index = (index + step) % DENSE_CIRCUIT.length;

        const currIdx = Math.floor(index);
        const nextIdx = (currIdx + 1) % DENSE_CIRCUIT.length;

        const p1 = DENSE_CIRCUIT[currIdx];
        const p2 = DENSE_CIRCUIT[nextIdx];

        carMarkerRef.current.setLatLng(p1);

        // Calculate vehicle bearing angle in degrees
        const dLat = p2[0] - p1[0];
        const dLng = p2[1] - p1[1];
        const angleDeg = Math.atan2(dLat, dLng) * (180 / Math.PI);
        // Leaflet / SVG orientation correction (North is up = negative dLat, East is right = positive dLng)
        const screenAngle = Math.atan2(-dLat, dLng) * (180 / Math.PI);

        const carEl = document.getElementById('footer-car-container');
        if (carEl) {
          carEl.style.transform = `rotate(${screenAngle}deg)`;
        }

        // Check nearest tourist destination
        let closest = REAL_DESTINATIONS[0];
        let minDist = Infinity;
        for (const dest of REAL_DESTINATIONS) {
          const d = Math.hypot(dest.lat - p1[0], dest.lng - p1[1]);
          if (d < minDist) {
            minDist = d;
            closest = dest;
          }
        }
        if (minDist < 0.05) {
          setNearestSpot(closest);
        }

        // Slight natural speed fluctuation
        setCurrentSpeedKmh(Math.round(38 + Math.sin(index * 0.1) * 7 * speed));
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isPlaying, speed]);

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-primary-800/50 bg-gradient-to-b from-surface-card/95 via-[#040e14]/98 to-surface-card/95 backdrop-blur-2xl p-4 sm:p-6 shadow-2xl">
      {/* Background radial atmosphere */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-primary-600/10 blur-[130px] pointer-events-none rounded-full" />

      {/* Header Telemetry HUD & Controls */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-surface-border/50 pb-4 mb-4">
        {/* Left: Branding & Status */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-teal-700 flex items-center justify-center text-white shadow-glow">
            <Compass size={22} className="animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-100 tracking-tight">
                Walasmulla Real Geographic Tour Radar
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                Live Simulation
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
              <span>Approaching Spot:</span>
              <span className="font-semibold text-primary-300">
                {nearestSpot.icon} {nearestSpot.name} ({nearestSpot.distance})
              </span>
              <span className="text-slate-600">·</span>
              <span className="font-mono text-emerald-400">{currentSpeedKmh} km/h</span>
            </p>
          </div>
        </div>

        {/* Right: Interactive controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Map Layer Switcher */}
          <div className="flex items-center rounded-lg border border-surface-border bg-surface/80 p-0.5">
            <button
              onClick={() => setActiveTile('dark')}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                activeTile === 'dark'
                  ? 'bg-primary-950 text-primary-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🌙 Dark
            </button>
            <button
              onClick={() => setActiveTile('satellite')}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                activeTile === 'satellite'
                  ? 'bg-primary-950 text-primary-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🛰️ Satellite
            </button>
            <button
              onClick={() => setActiveTile('street')}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                activeTile === 'street'
                  ? 'bg-primary-950 text-primary-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🗺️ Streets
            </button>
          </div>

          {/* 3D Perspective Tilt Button */}
          <button
            onClick={() => setIs3D(!is3D)}
            className={`btn-ghost text-xs px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all ${
              is3D
                ? 'bg-primary-950/80 border-primary-700/60 text-primary-300'
                : 'border-surface-border text-slate-400'
            }`}
            title="Toggle 3D Perspective Tilt"
          >
            <Eye size={13} /> {is3D ? '3D View' : '2D Map'}
          </button>

          {/* Speed Toggle */}
          <button
            onClick={() => setSpeed(s => (s === 1 ? 2 : s === 2 ? 0.5 : 1))}
            className="btn-ghost text-xs px-2.5 py-1.5 rounded-lg border border-surface-border text-slate-300 hover:text-primary-300 flex items-center gap-1"
            title="Tour Speed"
          >
            <FastForward size={13} /> {speed}x
          </button>

          {/* Play/Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="btn-primary text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-glow"
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} />}
            <span>{isPlaying ? 'Pause' : 'Tour'}</span>
          </button>
        </div>
      </div>

      {/* Real Map Stage with 3D Perspective Transform */}
      <div
        className="relative w-full h-[400px] sm:h-[460px] rounded-2xl overflow-hidden border border-surface-border/50 transition-all duration-700 ease-out"
        style={{
          perspective: '1200px',
        }}
      >
        <div
          className="w-full h-full transition-transform duration-700 ease-out origin-center"
          style={{
            transform: is3D
              ? 'rotateX(26deg) rotateZ(-2deg) scale(1.08) translateY(-15px)'
              : 'none',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Leaflet DOM container */}
          <div ref={mapContainerRef} className="w-full h-full z-0" />
        </div>

        {/* Floating Quick Legend in bottom corner */}
        <div className="absolute bottom-3 left-3 z-10 flex flex-wrap items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-950/85 border border-slate-800 text-[11px] text-slate-300 backdrop-blur-md shadow-lg pointer-events-none">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 shadow-[0_0_8px_#14b8a6]" />
            <span className="font-medium">Real Scenic Tour Route</span>
          </span>
          <span className="text-slate-600">·</span>
          <span>10 Destination Markers with Real GPS Coordinates</span>
          <span className="text-slate-600">·</span>
          <span className="text-primary-400 font-semibold">Walasmulla 25 km Circuit</span>
        </div>
      </div>
    </div>
  );
}
