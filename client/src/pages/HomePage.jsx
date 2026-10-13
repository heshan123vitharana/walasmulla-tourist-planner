/**
 * HomePage.jsx — Landing page with hero, feature highlights and quick links.
 */
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Shield, ChevronRight, Compass } from 'lucide-react';
import TourMapWidget from '../components/TourMapWidget';

const features = [
  {
    icon: MapPin,
    title: 'Discover Places',
    desc: 'Browse 10+ curated tourist spots within 25 km of Walasmulla — temples, beaches, wildlife and more.',
    link: '/places',
    cta:  'Explore Now',
  },
  {
    icon: Calendar,
    title: 'Build Your Day',
    desc: 'Auto-order your stops for the shortest route, or drag-and-drop to customise. See arrival times at a glance.',
    link: '/planner',
    cta:  'Start Planning',
  },
  {
    icon: Shield,
    title: 'Save & Revisit',
    desc: 'Create a free account to save unlimited day-plans and reload them any time on any device.',
    link: '/register',
    cta:  'Sign Up Free',
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden py-28 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/30 via-surface to-surface pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary-600/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glassmorphism text-primary-300 text-sm font-medium mb-2">
            <Compass size={14} /> Southern Sri Lanka · Walasmulla
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight">
            <span className="text-gradient">Plan Your Perfect</span>
            <br />Day in Walasmulla
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Discover temples, beaches, waterfalls and wildlife — all within a 25 km radius.
            Build a personalised itinerary in seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link to="/places" className="btn-primary text-base px-6 py-3">
              Explore Places <ChevronRight size={18} />
            </Link>
            <Link to="/planner" className="btn-secondary text-base px-6 py-3">
              <Calendar size={18} /> Plan a Day
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="page-container">
        <div className="grid sm:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc, link, cta }) => (
            <div key={title} className="card p-6 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-900/60 border border-primary-700/50 flex items-center justify-center text-primary-400">
                <Icon size={24} />
              </div>
              <div>
                <h3 className="text-slate-100 font-semibold mb-1">{title}</h3>
                <p className="text-slate-400 text-sm">{desc}</p>
              </div>
              <Link to={link} className="btn-secondary mt-auto w-full justify-center">
                {cta} <ChevronRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner with 1:1 Tour Map Preview */}
      <section className="page-container mt-16 mb-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-950 via-surface-card to-teal-950/70 border border-primary-800/40 p-8 sm:p-10 shadow-card">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
            
            {/* Left Column: Text & CTAs cleanly aligned to the left */}
            <div className="flex-1 space-y-4 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-900/60 border border-primary-700/50 text-primary-300 text-xs font-semibold">
                <Compass size={13} className="animate-spin-slow" />
                <span>Smart Day Circuit · Walasmulla 25 km</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-100">
                Ready to explore <span className="text-gradient">Walasmulla?</span>
              </h2>

              <p className="text-slate-400 text-sm sm:text-base max-w-xl leading-relaxed">
                Add your favorite cultural spots, beaches and viewpoints to your custom day itinerary in seconds. Discover all 10 curated destinations with automatic route optimization.
              </p>

              {/* Quick feature perks */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1 pb-2 text-xs text-slate-300">
                <div className="flex items-center gap-1.5">
                  <span className="text-primary-400 font-bold">✓</span> 10 Curated Spots
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-primary-400 font-bold">✓</span> 25 km Circuit
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-primary-400 font-bold">✓</span> Shortest Route Calc
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link to="/planner" className="btn-primary px-6 py-2.5">
                  <Calendar size={18} /> Open Day Planner
                </Link>
                <Link to="/places" className="btn-secondary px-6 py-2.5">
                  Browse 10+ Places
                </Link>
              </div>
            </div>

            {/* Right Column: 1:1 Compact Tour Map Widget */}
            <div className="shrink-0 flex flex-col items-center">
              <TourMapWidget />
              <span className="text-[11px] text-slate-500 mt-2">
                Click map to expand 3D radar
              </span>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
