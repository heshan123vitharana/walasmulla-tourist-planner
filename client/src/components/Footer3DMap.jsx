/**
 * Footer3DMap.jsx — Interactive 3D Perspective Map with animated vehicle touring Southern Sri Lanka.
 * Features:
 *   - 3D tilted isometric perspective with glowing terrain grid
 *   - Road network connecting key tourist destinations around Walasmulla (25 km radius)
 *   - Smooth 60fps vehicle animation following the scenic tour circuit with rotating headlights
 *   - Active waypoint detection & live telemetry HUD
 *   - Interactive destination pins with distance callouts
 */
import { useEffect, useRef, useState } from 'react';
import { Compass, Car, Play, Pause, FastForward, Eye, MapPin, Sparkles } from 'lucide-react';

const DESTINATIONS = [
  { id: 'walasmulla', name: 'Walasmulla Town Hub', icon: '📍', x: 420, y: 250, distance: '0 km', type: 'Hub' },
  { id: 'mulkirigala', name: 'Mulkirigala Rock Temple', icon: '🏛️', x: 330, y: 160, distance: '11 km', type: 'Heritage' },
  { id: 'muruthawela', name: 'Muruthawela Reservoir', icon: '💧', x: 190, y: 210, distance: '16 km', type: 'Nature' },
  { id: 'kasagala', name: 'Kasagala Raja Maha Vihara', icon: '⛩️', x: 560, y: 150, distance: '14 km', type: 'Religious' },
  { id: 'ussangoda', name: 'Ussangoda Red Cliffs', icon: '🪨', x: 740, y: 260, distance: '26 km', type: 'Nature' },
  { id: 'kalametiya', name: 'Kalametiya Bird Sanctuary', icon: '🪶', x: 700, y: 370, distance: '24 km', type: 'Nature' },
  { id: 'rekawa', name: 'Rekawa Turtle Beach', icon: '🐢', x: 590, y: 350, distance: '22 km', type: 'Nature' },
  { id: 'tangalle', name: 'Tangalle Sandy Bay', icon: '🏖️', x: 470, y: 390, distance: '19 km', type: 'Beach' },
  { id: 'hummanaya', name: 'Hummanaya Blowhole', icon: '💨', x: 340, y: 430, distance: '24 km', type: 'Nature' },
  { id: 'wewurukannala', name: 'Wewurukannala Vihara', icon: '🛕', x: 260, y: 350, distance: '22 km', type: 'Cultural' },
];

// Closed circuit path traversing the scenic highlights
const CIRCUIT_PATH = `
  M 420,250
  C 380,210 350,180 330,160
  C 260,140 210,180 190,210
  C 230,240 360,240 420,250
  C 480,210 520,170 560,150
  C 640,170 700,210 740,260
  C 730,320 720,350 700,370
  C 660,370 620,350 590,350
  C 540,370 500,390 470,390
  C 410,420 370,430 340,430
  C 290,410 270,380 260,350
  C 270,290 350,270 420,250
`;

export default function Footer3DMap() {
  const pathRef = useRef(null);
  const animFrameRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [is3D, setIs3D] = useState(true);
  const [hoveredSpot, setHoveredSpot] = useState(null);
  const [nearestSpot, setNearestSpot] = useState(DESTINATIONS[0]);
  const [carState, setCarState] = useState({ x: 420, y: 250, angle: 0, progress: 0 });

  useEffect(() => {
    let progress = carState.progress;
    let lastTime = performance.now();

    const loop = (currentTime) => {
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (isPlaying && pathRef.current) {
        const pathEl = pathRef.current;
        const totalLength = pathEl.getTotalLength();

        // Increment progress (circuit loop in ~24s at 1x speed)
        const speedMultiplier = (totalLength / 24) * speed;
        progress = (progress + speedMultiplier * delta) % totalLength;

        const p1 = pathEl.getPointAtLength(progress);
        const p2 = pathEl.getPointAtLength((progress + 3) % totalLength);

        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI);

        setCarState({ x: p1.x, y: p1.y, angle, progress });

        // Find nearest destination
        let closest = DESTINATIONS[0];
        let minDist = Infinity;
        for (const dest of DESTINATIONS) {
          const d = Math.hypot(dest.x - p1.x, dest.y - p1.y);
          if (d < minDist) {
            minDist = d;
            closest = dest;
          }
        }
        if (minDist < 60) {
          setNearestSpot(closest);
        }
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isPlaying, speed]);

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-primary-800/40 bg-gradient-to-b from-surface-card/90 via-[#071318]/95 to-surface-card/90 backdrop-blur-2xl p-4 sm:p-6 shadow-2xl">
      {/* Background radial atmosphere */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-primary-600/10 blur-[120px] pointer-events-none rounded-full" />

      {/* Header telemetry HUD */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-surface-border/50 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-500/10 border border-primary-500/30 flex items-center justify-center text-primary-400 shadow-glow">
            <Compass size={20} className="animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-100 tracking-tight">
                Walasmulla Tourism Radar
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Live 3D Route
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <span>Next Highlight:</span>
              <span className="font-semibold text-primary-300">
                {nearestSpot.icon} {nearestSpot.name} ({nearestSpot.distance})
              </span>
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setIs3D(!is3D)}
            className={`btn-ghost text-xs px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all ${
              is3D
                ? 'bg-primary-950/80 border-primary-700/60 text-primary-300'
                : 'border-surface-border text-slate-400'
            }`}
            title="Toggle 3D Isometric View"
          >
            <Eye size={13} /> {is3D ? '3D Angle' : '2D Plan'}
          </button>

          <button
            onClick={() => setSpeed(s => (s === 1 ? 2 : s === 2 ? 0.5 : 1))}
            className="btn-ghost text-xs px-2.5 py-1.5 rounded-lg border border-surface-border text-slate-300 hover:text-primary-300 flex items-center gap-1"
            title="Simulation Speed"
          >
            <FastForward size={13} /> {speed}x Speed
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="btn-primary text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-glow"
            title={isPlaying ? 'Pause Simulation' : 'Start Simulation'}
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} />}
            <span>{isPlaying ? 'Pause' : 'Tour'}</span>
          </button>
        </div>
      </div>

      {/* 3D Perspective Map Stage */}
      <div
        className="relative w-full h-[380px] sm:h-[440px] flex items-center justify-center overflow-hidden rounded-2xl bg-[#040d12] border border-surface-border/40 select-none cursor-crosshair transition-transform duration-700 ease-out"
        style={{
          perspective: '1000px',
        }}
      >
        {/* Transforming plane container */}
        <div
          className="relative w-[900px] h-[520px] transition-transform duration-700 ease-out origin-center shrink-0"
          style={{
            transform: is3D
              ? 'rotateX(30deg) rotateZ(-4deg) translateY(-20px) scale(0.92)'
              : 'none',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Stylized Grid Ground Floor */}
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none opacity-40"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(20, 184, 166, 0.12) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(20, 184, 166, 0.12) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
            }}
          />

          {/* Walasmulla 25km Radius Radar Rings */}
          <div className="absolute left-[420px] top-[250px] -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] rounded-full border border-primary-500/15 pointer-events-none" />
          <div className="absolute left-[420px] top-[250px] -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full border border-primary-500/10 border-dashed pointer-events-none" />
          <div className="absolute left-[420px] top-[250px] -translate-x-1/2 -translate-y-1/2 text-[10px] font-mono text-primary-500/40 tracking-wider">
            25 KM RADIUS ZONE
          </div>

          {/* SVG Road Network & Circuit Line */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
            <defs>
              {/* Glowing Road Gradient */}
              <linearGradient id="roadGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0d9488" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#14b8a6" stopOpacity="1" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.8" />
              </linearGradient>

              {/* Headlight Beam Cone Filter */}
              <filter id="headlightBlur" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="6" />
              </filter>
            </defs>

            {/* Secondary linking routes */}
            <path
              d="M 420,250 L 330,160 M 420,250 L 560,150 M 420,250 L 470,390 M 420,250 L 260,350 M 470,390 L 590,350 M 590,350 L 700,370 M 700,370 L 740,260"
              stroke="#0f766e"
              strokeWidth="2"
              strokeDasharray="4 6"
              strokeOpacity="0.35"
              fill="none"
            />

            {/* Main Scenic Tour Circuit Road (Underneath Dark Track) */}
            <path
              d={CIRCUIT_PATH}
              stroke="#042f2e"
              strokeWidth="12"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            {/* Road borders */}
            <path
              d={CIRCUIT_PATH}
              stroke="#115e59"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            {/* Animated Glowing Centerline */}
            <path
              ref={pathRef}
              d={CIRCUIT_PATH}
              stroke="url(#roadGlow)"
              strokeWidth="2.5"
              strokeDasharray="6 8"
              className="animate-pulse"
              fill="none"
            />
          </svg>

          {/* Destination Markers */}
          {DESTINATIONS.map((dest) => {
            const isTarget = nearestSpot.id === dest.id;
            const isHovered = hoveredSpot?.id === dest.id;
            const isHub = dest.id === 'walasmulla';

            return (
              <div
                key={dest.id}
                onMouseEnter={() => setHoveredSpot(dest)}
                onMouseLeave={() => setHoveredSpot(null)}
                style={{
                  left: `${dest.x}px`,
                  top: `${dest.y}px`,
                  transform: 'translate(-50%, -50%)',
                }}
                className="absolute z-20 cursor-pointer group"
              >
                {/* Ping wave on nearest target */}
                {isTarget && (
                  <span className="absolute -inset-3 rounded-full bg-teal-400/20 animate-ping pointer-events-none" />
                )}

                {/* Marker Body */}
                <div
                  className={`relative flex items-center justify-center transition-transform duration-300 ${
                    isHovered || isTarget ? 'scale-125 -translate-y-2' : 'scale-100'
                  }`}
                >
                  {isHub ? (
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary-600 to-emerald-400 border-2 border-white/80 shadow-glow flex items-center justify-center text-lg text-white font-bold">
                      📍
                    </div>
                  ) : (
                    <div
                      className={`w-8 h-8 rounded-xl border flex items-center justify-center text-sm shadow-md transition-colors ${
                        isTarget
                          ? 'bg-teal-900 border-teal-300 shadow-glow text-white'
                          : 'bg-surface-card/90 border-surface-border text-slate-200 group-hover:border-primary-400'
                      }`}
                    >
                      {dest.icon}
                    </div>
                  )}

                  {/* Marker Pin Shadow */}
                  <div className="absolute -bottom-2 w-5 h-2 bg-black/60 rounded-full blur-[2px] pointer-events-none" />
                </div>

                {/* Always visible or hover badge */}
                <div
                  className={`absolute left-1/2 -translate-x-1/2 -top-8 px-2 py-0.5 rounded-md text-[11px] font-medium whitespace-nowrap transition-all duration-200 pointer-events-none shadow-lg ${
                    isTarget || isHovered
                      ? 'bg-slate-900/95 text-teal-300 border border-teal-500/50 opacity-100 scale-100'
                      : 'bg-slate-950/75 text-slate-300 border border-slate-800 opacity-80 scale-90'
                  }`}
                >
                  {dest.name.split(' ')[0]} · {dest.distance}
                </div>
              </div>
            );
          })}

          {/* 3D Animated Vehicle & Headlight Beam */}
          <div
            style={{
              left: `${carState.x}px`,
              top: `${carState.y}px`,
              transform: `translate(-50%, -50%) rotate(${carState.angle}deg)`,
              transformOrigin: 'center center',
            }}
            className="absolute z-30 pointer-events-none transition-transform duration-75"
          >
            {/* Glowing Golden Headlight Beam Projecting Forward */}
            <div
              className="absolute left-6 top-1/2 -translate-y-1/2 w-32 h-20 pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse at left, rgba(56, 189, 248, 0.6) 0%, rgba(20, 184, 166, 0.2) 40%, transparent 80%)',
                clipPath: 'polygon(0% 45%, 100% 0%, 100% 100%, 0% 55%)',
                filter: 'drop-shadow(0 0 10px rgba(56, 189, 248, 0.5))',
              }}
            />

            {/* Vehicle Ground Shadow */}
            <div className="absolute inset-0 w-9 h-5 -translate-x-1 translate-y-1 bg-black/80 rounded-full blur-[3px]" />

            {/* 3D Isometric Tour Jeep / SUV Asset */}
            <div className="relative w-8 h-5 rounded-md bg-gradient-to-r from-teal-400 via-primary-500 to-teal-600 border border-teal-200 shadow-[0_0_15px_#14b8a6] flex items-center justify-between px-1">
              {/* Back lights */}
              <div className="w-1 h-3 bg-rose-500 rounded-sm shadow-[0_0_6px_#f43f5e]" />

              {/* Roof Rack & Cab */}
              <div className="w-4 h-3 rounded-sm bg-slate-900 border border-teal-300/60 flex items-center justify-center">
                <div className="w-2.5 h-1.5 bg-sky-400/80 rounded-[1px]" />
              </div>

              {/* Front Headlights */}
              <div className="w-1 h-3 bg-amber-200 rounded-sm shadow-[0_0_8px_#fef08a]" />
            </div>

            {/* Mini Label Follower */}
            <div
              className="absolute -top-6 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-teal-950/90 text-teal-300 border border-teal-400/50 whitespace-nowrap"
              style={{ transform: `rotate(${-carState.angle}deg)` }}
            >
              TOUR JEEP
            </div>
          </div>
        </div>

        {/* Floating Quick Legend in bottom left corner */}
        <div className="absolute bottom-3 left-3 z-20 flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 backdrop-blur-md">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 shadow-[0_0_6px_#14b8a6]" />
            <span>Scenic Tour Circuit</span>
          </span>
          <span className="text-slate-600">·</span>
          <span>10 Key Destinations Marked</span>
        </div>
      </div>
    </div>
  );
}
