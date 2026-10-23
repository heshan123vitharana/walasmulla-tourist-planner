/**
 * TourMapWidget.jsx — Compact 1:1 Live Tour Radar Thumbnail with Expandable Full-Screen 3D Modal.
 * Placed on the right side of "Ready to explore Walasmulla?" CTA card.
 */
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Compass, Maximize2, X, Eye, Play, Pause, FastForward,
  MapPin, Sparkles, Navigation, Layers
} from 'lucide-react';

// Real coordinates of the 10 spots around Walasmulla
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

export default function TourMapWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTile, setActiveTile] = useState('dark');
  const [is3D, setIs3D] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [nearestSpot, setNearestSpot] = useState(REAL_DESTINATIONS[0]);
  const [currentSpeedKmh, setCurrentSpeedKmh] = useState(42);

  // Mini map refs for landing page preview
  const miniMapContainerRef = useRef(null);
  const miniMapInstanceRef = useRef(null);
  const miniCarMarkerRef = useRef(null);
  const miniAnimFrameRef = useRef(null);

  // Modal map refs
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const carMarkerRef = useRef(null);
  const animFrameRef = useRef(null);

  // Initialize Mini Map with real dark map tiles
  useEffect(() => {
    if (!miniMapContainerRef.current || miniMapInstanceRef.current) return;

    const initTimer = setTimeout(() => {
      if (!miniMapContainerRef.current) return;

      const map = L.map(miniMapContainerRef.current, {
        center: [6.09, 80.81],
        zoom: 11,
        minZoom: 10,
        maxZoom: 14,
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        touchZoom: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
      });
      miniMapInstanceRef.current = map;

      // Real Dark Map Tiles
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        className: 'leaflet-dark-tiles',
      }).addTo(map);

      // Fit bounds to Southern Sri Lanka circuit
      map.fitBounds([
        [5.95, 80.61],
        [6.23, 81.01]
      ], { padding: [24, 24] });

      // Circuit polyline - glow
      L.polyline(ROAD_CIRCUIT_WAYPOINTS, {
        color: '#0d9488',
        weight: 7,
        opacity: 0.45,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      // Circuit polyline - primary dashed
      L.polyline(ROAD_CIRCUIT_WAYPOINTS, {
        color: '#14b8a6',
        weight: 3,
        dashArray: '6 8',
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      // Real destination markers on the mini map
      REAL_DESTINATIONS.forEach((dest) => {
        const isHub = dest.id === 'walasmulla';
        const iconHtml = `
          <div style="display:flex;align-items:center;justify-content:center;">
            <div style="
              width: ${isHub ? '16px' : '10px'};
              height: ${isHub ? '16px' : '10px'};
              border-radius: 9999px;
              background: ${isHub ? '#2dd4bf' : '#0f172a'};
              border: 2px solid ${isHub ? '#ffffff' : '#2dd4bf'};
              box-shadow: 0 0 10px ${isHub ? '#2dd4bf' : 'rgba(45, 212, 191, 0.6)'};
            "></div>
          </div>
        `;
        L.marker([dest.lat, dest.lng], {
          icon: L.divIcon({
            html: iconHtml,
            className: 'mini-dest-pin',
            iconSize: [isHub ? 16 : 10, isHub ? 16 : 10],
            iconAnchor: [isHub ? 8 : 5, isHub ? 8 : 5],
          }),
          interactive: false,
        }).addTo(map);
      });

      // Animated car marker on mini map
      const carHtml = `
        <div style="position:relative;display:flex;align-items:center;justify-content:center;">
          <span style="position:absolute;inset:-6px;border-radius:9999px;background:rgba(45,212,191,0.5);animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></span>
          <div style="width:24px;height:24px;border-radius:9999px;background:linear-gradient(135deg,#fde047,#2dd4bf);border:2px solid #ffffff;box-shadow:0 0 14px #38bdf8;display:flex;align-items:center;justify-content:center;font-size:12px;">
            🚗
          </div>
        </div>
      `;

      miniCarMarkerRef.current = L.marker(DENSE_CIRCUIT[0], {
        icon: L.divIcon({
          html: carHtml,
          className: 'mini-car-marker',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        }),
        zIndexOffset: 1000,
        interactive: false,
      }).addTo(map);

      map.invalidateSize();
    }, 120);

    return () => {
      clearTimeout(initTimer);
      if (miniMapInstanceRef.current) {
        miniMapInstanceRef.current.remove();
        miniMapInstanceRef.current = null;
      }
    };
  }, []);

  // Mini Map 60fps Car Animation
  useEffect(() => {
    let index = 0;
    let lastTime = performance.now();

    const loop = (currentTime) => {
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (miniCarMarkerRef.current && DENSE_CIRCUIT.length > 0) {
        index = (index + delta * 22) % DENSE_CIRCUIT.length;
        const pt = DENSE_CIRCUIT[Math.floor(index)];
        miniCarMarkerRef.current.setLatLng(pt);
      }
      miniAnimFrameRef.current = requestAnimationFrame(loop);
    };

    miniAnimFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (miniAnimFrameRef.current) {
        cancelAnimationFrame(miniAnimFrameRef.current);
      }
    };
  }, []);

  // Keyboard escape listener to close modal
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Initialize Leaflet Map when modal opens
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    // Small delay to allow modal transition
    const initTimer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center: [6.09, 80.81],
        zoom: 11,
        minZoom: 10,
        maxZoom: 16,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: true,
      });
      mapInstanceRef.current = map;

      const initTile = MAP_TILES[activeTile];
      tileLayerRef.current = L.tileLayer(initTile.url, {
        maxZoom: 19,
        className: initTile.className || '',
      }).addTo(map);

      L.control.zoom({ position: 'topright' }).addTo(map);

      // Polyline routes
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

      // Pins
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

      // Animated vehicle
      const carIconHtml = `
        <div id="modal-car-container" style="
          position: relative;
          width: 36px;
          height: 20px;
          transform-origin: center center;
          transition: transform 0.08s linear;
        ">
          <!-- Headlight Beam -->
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
          <!-- Shadow -->
          <div style="
            position: absolute;
            inset: 0;
            background: rgba(0,0,0,0.8);
            border-radius: 9999px;
            transform: translateY(2px) scale(0.9);
            filter: blur(2px);
          "></div>
          <!-- Vehicle -->
          <div style="
            position: relative;
            width: 32px;
            height: 18px;
            background: linear-gradient(90deg, #14b8a6, #0d9488 60%, #042f2e);
            border: 1.5px solid #5eead4;
            border-radius: 5px;
            box-shadow: 0 0 14px #14b8a6;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 2px;
          ">
            <div style="width: 2px; height: 10px; background: #f43f5e; border-radius: 1px; box-shadow: 0 0 6px #f43f5e;"></div>
            <div style="width: 14px; height: 10px; background: #0f172a; border: 1px solid rgba(94, 234, 212, 0.6); border-radius: 2px; display: flex; align-items: center; justify-content: center;">
              <div style="width: 8px; height: 4px; background: #38bdf8; border-radius: 1px; opacity: 0.85;"></div>
            </div>
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

      map.invalidateSize();
    }, 120);

    return () => {
      clearTimeout(initTimer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen]);

  // Handle tile switch in modal
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    mapInstanceRef.current.removeLayer(tileLayerRef.current);
    const updatedTile = MAP_TILES[activeTile];
    tileLayerRef.current = L.tileLayer(updatedTile.url, {
      maxZoom: 19,
      className: updatedTile.className || '',
    }).addTo(mapInstanceRef.current);
  }, [activeTile]);

  // Modal 60fps car animation
  useEffect(() => {
    if (!isOpen) return;
    let index = 0;
    let lastTime = performance.now();

    const loop = (currentTime) => {
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (isPlaying && carMarkerRef.current && DENSE_CIRCUIT.length > 0) {
        const step = delta * 18 * speed;
        index = (index + step) % DENSE_CIRCUIT.length;

        const currIdx = Math.floor(index);
        const nextIdx = (currIdx + 1) % DENSE_CIRCUIT.length;

        const p1 = DENSE_CIRCUIT[currIdx];
        const p2 = DENSE_CIRCUIT[nextIdx];

        carMarkerRef.current.setLatLng(p1);

        const dLat = p2[0] - p1[0];
        const dLng = p2[1] - p1[1];
        const screenAngle = Math.atan2(-dLat, dLng) * (180 / Math.PI);

        const carEl = document.getElementById('modal-car-container');
        if (carEl) {
          carEl.style.transform = `rotate(${screenAngle}deg)`;
        }

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

        setCurrentSpeedKmh(Math.round(38 + Math.sin(index * 0.1) * 7 * speed));
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isOpen, isPlaying, speed]);



  return (
    <>
      {/* ─── Large 1:1 Radar Box on Landing Page with Real Map Background ─── */}
      <div
        onClick={() => setIsOpen(true)}
        className="group relative aspect-square w-full max-w-[420px] sm:max-w-[480px] lg:max-w-[520px] xl:max-w-[540px] cursor-pointer overflow-hidden rounded-3xl border-2 border-primary-500/30 bg-[#040e14] shadow-2xl transition-all duration-300 hover:border-primary-400 hover:shadow-glow hover:scale-[1.01]"
        title="Click to expand 3D Interactive Map"
      >
        {/* Real Leaflet Dark Map Background Layer */}
        <div ref={miniMapContainerRef} className="absolute inset-0 z-0 w-full h-full pointer-events-none" />

        {/* Ambient Radar Glow & Dark Vignette */}
        <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-slate-950/75 via-transparent to-slate-950/50" />
        <div className="absolute inset-0 z-10 pointer-events-none rounded-3xl shadow-[inset_0_0_50px_rgba(4,14,20,0.85)]" />

        {/* Radar concentric circles on top of Real Map */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[82%] h-[82%] rounded-full border border-teal-400/25 pointer-events-none z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[58%] h-[58%] rounded-full border border-teal-400/30 border-dashed pointer-events-none z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32%] h-[32%] rounded-full border border-teal-400/20 pointer-events-none z-10" />

        {/* Radar crosshairs */}
        <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-teal-400/20 pointer-events-none z-10" />
        <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-teal-400/20 pointer-events-none z-10" />

        {/* Top Floating Badge */}
        <div className="absolute top-3.5 left-3.5 z-20 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/90 border border-teal-500/40 text-xs font-semibold text-teal-300 backdrop-blur-md shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>3D Live Circuit</span>
        </div>

        {/* Bottom Expand Prompt Overlay */}
        <div className="absolute inset-x-0 bottom-0 z-20 p-3.5 bg-gradient-to-t from-slate-950 via-slate-950/85 to-transparent flex items-center justify-between text-xs text-slate-300 group-hover:text-teal-300 transition-colors">
          <span className="text-xs font-medium flex items-center gap-1.5">
            <Compass size={15} className="text-teal-400 animate-spin-slow" />
            Click to view full 3D radar
          </span>
          <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300 group-hover:bg-teal-500 group-hover:text-slate-950 transition-all">
            <Maximize2 size={14} />
          </div>
        </div>
      </div>

      {/* ─── Expandable Full 3D Map Modal ─── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl rounded-3xl border border-primary-700/60 bg-[#030c10] shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-border/50 px-5 py-4 bg-surface-card/90">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-teal-700 flex items-center justify-center text-white shadow-glow">
                  <Compass size={20} className="animate-spin-slow" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <span>Walasmulla Real Geographic Tour Radar</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      Live GPS
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 flex items-center gap-2">
                    <span>Touring Near:</span>
                    <span className="font-semibold text-primary-300">
                      {nearestSpot.icon} {nearestSpot.name} ({nearestSpot.distance})
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="font-mono text-emerald-400">{currentSpeedKmh} km/h</span>
                  </p>
                </div>
              </div>

              {/* Controls and Close Button */}
              <div className="flex items-center gap-2 text-xs">
                {/* Layer switch */}
                <div className="flex items-center rounded-lg border border-surface-border bg-surface/80 p-0.5">
                  <button
                    onClick={() => setActiveTile('dark')}
                    className={`px-2 py-1 rounded text-xs transition-colors ${
                      activeTile === 'dark' ? 'bg-primary-950 text-primary-300 font-semibold' : 'text-slate-400'
                    }`}
                  >
                    🌙 Dark
                  </button>
                  <button
                    onClick={() => setActiveTile('satellite')}
                    className={`px-2 py-1 rounded text-xs transition-colors ${
                      activeTile === 'satellite' ? 'bg-primary-950 text-primary-300 font-semibold' : 'text-slate-400'
                    }`}
                  >
                    🛰️ Satellite
                  </button>
                  <button
                    onClick={() => setActiveTile('street')}
                    className={`px-2 py-1 rounded text-xs transition-colors ${
                      activeTile === 'street' ? 'bg-primary-950 text-primary-300 font-semibold' : 'text-slate-400'
                    }`}
                  >
                    🗺️ Streets
                  </button>
                </div>

                {/* 3D toggle */}
                <button
                  onClick={() => setIs3D(!is3D)}
                  className={`btn-ghost text-xs px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 ${
                    is3D ? 'bg-primary-950 border-primary-700 text-primary-300' : 'border-surface-border text-slate-400'
                  }`}
                >
                  <Eye size={13} /> {is3D ? '3D View' : '2D Map'}
                </button>

                {/* Speed */}
                <button
                  onClick={() => setSpeed((s) => (s === 1 ? 2 : s === 2 ? 0.5 : 1))}
                  className="btn-ghost text-xs px-2 py-1.5 rounded-lg border border-surface-border text-slate-300"
                >
                  <FastForward size={13} /> {speed}x
                </button>

                {/* Play/pause */}
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="btn-primary text-xs px-2.5 py-1.5 rounded-lg"
                >
                  {isPlaying ? <Pause size={13} /> : <Play size={13} />}
                </button>

                {/* Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="ml-2 w-8 h-8 rounded-lg bg-surface border border-surface-border text-slate-400 hover:text-white hover:border-rose-500/50 flex items-center justify-center transition-colors"
                  title="Close (Esc)"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Map Body with 3D Tilt container */}
            <div
              className="relative w-full h-[520px] overflow-hidden bg-[#040e14] transition-all"
              style={{ perspective: '1200px' }}
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
                <div ref={mapContainerRef} className="w-full h-full" />
              </div>

              {/* Bottom Info Bar inside modal */}
              <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/85 border border-slate-800 text-[11px] text-slate-300 backdrop-blur-md shadow-lg pointer-events-none">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-400 shadow-[0_0_8px_#14b8a6]" />
                <span>10 Locations Marked · Click any marker for details & distance</span>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
