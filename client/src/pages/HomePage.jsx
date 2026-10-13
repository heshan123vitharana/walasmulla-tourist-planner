/**
 * HomePage.jsx — Landing page with hero, feature highlights and quick links.
 */
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Shield, ChevronRight, Compass } from 'lucide-react';

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

      {/* Footer */}
      <footer className="text-center py-10 text-slate-600 text-sm mt-10">
        <p>Walasmulla Local Tourist Day-Visit Planner · ITE2953 Group Project</p>
      </footer>
    </div>
  );
}
