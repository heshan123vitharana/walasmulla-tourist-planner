/**
 * Footer.jsx — Modern, premium footer for Walasmulla Tourist Planner.
 */
import { Link } from 'react-router-dom';
import {
  Compass, MapPin, Calendar, Heart, Shield, Clock,
  ExternalLink, Sparkles, Navigation, PhoneCall
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative mt-24 border-t border-white/10 bg-[#040507] backdrop-blur-2xl">
      {/* Top subtle gradient glow bar */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-teal-400/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          
          {/* Col 1: Brand & About */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-teal-700 flex items-center justify-center text-white shadow-glow">
                <Compass size={22} className="animate-spin-slow" />
              </div>
              <span className="font-extrabold text-lg text-slate-100 tracking-tight">
                Walasmulla <span className="text-primary-400">Planner</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your smart day-tour companion for exploring hidden southern gems — serene rock temples, pristine beaches, and wildlife sanctuaries within 25 km of Walasmulla.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-950/70 border border-primary-800/40 text-primary-300 text-xs">
              <MapPin size={12} /> Southern Province · Sri Lanka
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-slate-200 font-semibold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <Navigation size={14} className="text-primary-400" /> Quick Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/places" className="text-slate-400 hover:text-primary-300 transition-colors flex items-center gap-2">
                  <span>Browse Places</span>
                </Link>
              </li>
              <li>
                <Link to="/planner" className="text-slate-400 hover:text-primary-300 transition-colors flex items-center gap-2">
                  <span>Smart Day Planner</span>
                </Link>
              </li>
              <li>
                <Link to="/my-plans" className="text-slate-400 hover:text-primary-300 transition-colors flex items-center gap-2">
                  <span>My Saved Itineraries</span>
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-slate-400 hover:text-primary-300 transition-colors flex items-center gap-2">
                  <span>Create Free Account</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Highlighted Destinations */}
          <div>
            <h4 className="text-slate-200 font-semibold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sparkles size={14} className="text-primary-400" /> Must-Visit Spots
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li className="hover:text-slate-200 transition-colors flex items-center justify-between">
                <span>Mulkirigala Rock Temple</span>
                <span className="text-xs text-primary-400/80 font-mono">11 km</span>
              </li>
              <li className="hover:text-slate-200 transition-colors flex items-center justify-between">
                <span>Tangalle Sandy Beach</span>
                <span className="text-xs text-primary-400/80 font-mono">19 km</span>
              </li>
              <li className="hover:text-slate-200 transition-colors flex items-center justify-between">
                <span>Hummanaya Blowhole</span>
                <span className="text-xs text-primary-400/80 font-mono">24 km</span>
              </li>
              <li className="hover:text-slate-200 transition-colors flex items-center justify-between">
                <span>Rekawa Turtle Sanctuary</span>
                <span className="text-xs text-primary-400/80 font-mono">22 km</span>
              </li>
              <li className="hover:text-slate-200 transition-colors flex items-center justify-between">
                <span>Kalametiya Bird Sanctuary</span>
                <span className="text-xs text-primary-400/80 font-mono">25 km</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Traveler Tips & Info */}
          <div>
            <h4 className="text-slate-200 font-semibold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <Shield size={14} className="text-primary-400" /> Traveler Guidelines
            </h4>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="p-3 rounded-xl bg-surface/50 border border-surface-border">
                <span className="font-medium text-slate-300 block mb-1">🏛️ Temple Etiquette:</span>
                Modest attire (shoulders and knees covered). Remove footwear before shrine entry.
              </div>
              <div className="p-3 rounded-xl bg-surface/50 border border-surface-border">
                <span className="font-medium text-slate-300 block mb-1">🕒 Recommended Travel:</span>
                Start morning trips before 08:30 AM to avoid peak midday tropical heat.
              </div>
            </div>
          </div>

        </div>

        {/* Bottom divider and copyright */}
        <div className="mt-14 pt-8 border-t border-surface-border/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} Walasmulla Tourist Day-Visit Planner · Built for Southern Sri Lanka Tourism.
          </p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-slate-400">
              BIT / ITE2953 Programming Group Project
            </span>
            <span className="text-slate-600">·</span>
            <span className="inline-flex items-center gap-1 text-slate-400">
              Made with <Heart size={12} className="text-rose-500 fill-rose-500" />
            </span>
          </div>
        </div>

        {/* Giant Watermark Typography matching Reference UI - 100% Vector Responsive */}
        <div className="mt-8 -mb-6 w-full select-none pointer-events-none flex justify-center">
          <svg
            viewBox="0 0 1200 180"
            className="w-full max-w-5xl h-auto max-h-28 sm:max-h-36 opacity-75"
            preserveAspectRatio="xMidYMid meet"
          >
            <text
              x="50%"
              y="55%"
              dominantBaseline="middle"
              textAnchor="middle"
              className="fill-white/[0.05] font-black tracking-wider"
              fontSize="165"
              fontFamily="inherit"
              fontWeight="900"
            >
              WALASMULLA
            </text>
          </svg>
        </div>
      </div>
    </footer>
  );
}
