/**
 * HomePage.jsx — Premium landing page for Walasmulla Tourist Day-Visit Planner.
 * Designed with modern dark aesthetics, bento storytelling, interactive destination showcase,
 * floating tablet mockups, collapsible FAQ accordion, and 3D radar map integration.
 */
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass, MapPin, Calendar, Clock, ChevronRight, ChevronDown,
  Navigation, Sparkles, Shield, Waves, Mountain, Feather, CheckCircle2,
  ExternalLink, Layers, ArrowRight, Play, ArrowUp
} from 'lucide-react';
import TourMapWidget from '../components/TourMapWidget';

// 4K Background Slideshow for Hero Section
const HERO_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=2560&q=85',
    title: 'Mulkirigala & Sacred Heritage',
    location: 'Ancient Rock Cave Monasteries',
    tag: '🏛️ Sacred Heritage',
  },
  {
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2560&q=85',
    title: 'Tangalle Bay & Turtle Beach',
    location: 'Golden Palm-Fringed Shores',
    tag: '🏖️ Coastal Paradise',
  },
  {
    url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=2560&q=85',
    title: 'Hummanaya Blowhole & Ocean Cliffs',
    location: 'Dramatic Natural Rock Formations',
    tag: '💨 Natural Wonders',
  },
  {
    url: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=2560&q=85',
    title: 'Muruthawela & Rainforest Canopies',
    location: 'Serene Mountain Lakes & Wildlife',
    tag: '🌿 Lush Wildlife',
  },
];

// Curated Showcase Destinations for "Inspire Your Adventure"
const SHOWCASE_DESTINATIONS = [
  {
    id: 'mulkirigala',
    name: 'Mulkirigala Rock Temple',
    category: 'Heritage',
    distanceKm: 11,
    duration: '2 Hours',
    image: 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=1200&q=80',
    description: 'Ancient rock monastery dating back to the 2nd century BC. Climb 533 steps across 7 distinct terraces to explore sacred cave shrines and panoramic jungle views.',
    tags: ['Sacred Cave Art', 'Panoramic Lookout', 'Historical Relics'],
  },
  {
    id: 'tangalle',
    name: 'Tangalle Sandy Beach',
    category: 'Beach',
    distanceKm: 19,
    duration: '2.5 Hours',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    description: 'Golden sweeping sands lined with palm groves along the Indian Ocean. Perfect for coastal walks, fresh coconut refreshments, and scenic sunset relaxation.',
    tags: ['Palm Groves', 'Sunset Point', 'Coastal Strolls'],
  },
  {
    id: 'hummanaya',
    name: 'Hummanaya Natural Blowhole',
    category: 'Nature',
    distanceKm: 24,
    duration: '1.5 Hours',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
    description: 'The only natural blowhole in Sri Lanka and the second largest in the world. Ocean swell forces majestic water plumes up to 30 meters high through a sea cliff fissure.',
    tags: ['30m Water Plume', 'Sea Cliffs', 'Geological Wonder'],
  },
  {
    id: 'rekawa',
    name: 'Rekawa Turtle Conservation',
    category: 'Wildlife',
    distanceKm: 22,
    duration: '2 Hours',
    image: 'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?auto=format&fit=crop&w=1200&q=80',
    description: 'World-renowned nesting habitat for 5 species of sea turtles. Non-intrusive night watches led by local naturalists protect mother turtles and emerging hatchlings.',
    tags: ['5 Turtle Species', 'Night Beach Patrol', 'Eco-Conservation'],
  },
  {
    id: 'kalametiya',
    name: 'Kalametiya Bird Sanctuary',
    category: 'Wildlife',
    distanceKm: 25,
    duration: '2.5 Hours',
    image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=1200&q=80',
    description: 'Ramsar wetland sanctuary boasting rich coastal lagoons, mangroves, and over 150 bird species including native aquatic fowl and winter migrants.',
    tags: ['150+ Bird Species', 'Lagoon Boat Safari', 'Mangrove Trails'],
  },
];

// Interactive FAQ Data
const FAQS = [
  {
    q: 'How does the route optimization algorithm work?',
    a: 'The planner implements a Greedy Nearest-Neighbor algorithm starting from the Walasmulla Clock Tower (6.1528° N, 80.6981° E). At each step, it chooses the closest unvisited stop using verified road network distances, minimizing travel time and avoiding unnecessary backtracking.',
  },
  {
    q: 'Why is the tour planner focused on a 25 km radius?',
    a: 'Walasmulla is centrally positioned in the Southern Province. A 25 km boundary allows travelers to comfortably cover ancient rock temples, coastal bays, and wildlife reserves in a single day (08:00 to 18:00) without spending excessive hours inside a vehicle.',
  },
  {
    q: 'What is the recommended daylight tour window?',
    a: 'We recommend starting tours between 08:00 AM and 08:30 AM to beat midday tropical heat at outdoor temples like Mulkirigala. Most heritage sites close around 05:30 PM, ensuring a safe return to Walasmulla by 06:00 PM.',
  },
  {
    q: 'Can I include Rekawa Turtle Watch in my evening schedule?',
    a: 'Yes! While standard daytime attractions wrap up by 06:00 PM, Rekawa Turtle Conservation runs guided night watches between 08:00 PM and 11:00 PM when sea turtles come ashore to lay eggs. You can adjust your stops accordingly.',
  },
  {
    q: 'Do I need an account to plan and optimize trips?',
    a: 'No account is required to browse places, simulate routes, or test shortest-path sequences. Creating a free account allows you to save unlimited day-plans to your profile, name them, and revisit them anytime on mobile or desktop.',
  },
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeDestIdx, setActiveDestIdx] = useState(0);
  const [isDestPaused, setIsDestPaused] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Show scroll-to-top button after scrolling 400px
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-advance hero slideshow every 5.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  // Auto-advance destination showcase every 4 seconds (auto-loop)
  useEffect(() => {
    if (isDestPaused) return;
    const timer = setInterval(() => {
      setActiveDestIdx((prev) => (prev + 1) % SHOWCASE_DESTINATIONS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isDestPaused]);

  const activeDestination = SHOWCASE_DESTINATIONS[activeDestIdx];

  return (
    <div className="relative overflow-hidden bg-[#050608]">
      {/* ─────────────────────────────────────────────────────────── */}
      {/* 1. HERO SECTION WITH 4K SLIDESHOW & FLOATING TABLET MOCKUP  */}
      {/* ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center pt-24 pb-16 px-4">
        {/* Background Slideshow Layer */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {HERO_IMAGES.map((img, idx) => (
            <div
              key={img.url}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                idx === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <img
                src={img.url}
                alt={img.title}
                className={`w-full h-full object-cover object-center transform transition-transform duration-[6000ms] ease-out ${
                  idx === currentSlide ? 'scale-105' : 'scale-100'
                }`}
              />
            </div>
          ))}

          {/* Deep Black Film Overlays */}
          <div className="absolute inset-0 bg-black/65 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-transparent to-[#050608] pointer-events-none" />
        </div>

        {/* Hero Text Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6 pt-8">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight drop-shadow-xl text-white leading-[1.1]">
            Your Smart Day Planner with{' '}
            <span className="text-gradient">One-Click Routing</span>
          </h1>

          <p className="text-slate-300 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed drop-shadow font-light">
            Sequence ancient cave temples, pristine southern beaches, and tropical bird sanctuaries within a 25 km radius of Walasmulla Clock Tower.
          </p>

          <div className="flex flex-col sm:flex-row gap-3.5 justify-center items-center pt-2">
            <Link to="/planner" className="btn-primary text-base px-7 py-3.5 shadow-glow rounded-xl font-semibold flex items-center gap-2">
              <Calendar size={18} />
              <span>Start Day Planning</span>
            </Link>
            <Link to="/places" className="btn-secondary text-base px-7 py-3.5 bg-white/5 hover:bg-white/10 border-white/15 rounded-xl font-semibold flex items-center gap-2">
              <Compass size={18} />
              <span>Explore 10 Spots</span>
            </Link>
          </div>
        </div>



        {/* Hero Slideshow Bullet Indicators */}
        <div className="relative z-10 flex items-center justify-center gap-2 mt-8">
          {HERO_IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`transition-all duration-300 rounded-full ${
                i === currentSlide
                  ? 'w-8 h-2 bg-gradient-to-r from-teal-400 to-primary-500 shadow-[0_0_8px_#14b8a6]'
                  : 'w-2 h-2 bg-slate-600/70 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 2. HOW IT WORKS (BENTO STORYTELLING MATCHING REFERENCE UI)  */}
      {/* ─────────────────────────────────────────────────────────── */}
      <section className="page-container py-20">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-950/80 border border-primary-800/40 text-primary-300 text-xs font-semibold uppercase tracking-wider">
            <span>Step By Step</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
            How It Works
          </h2>
          <p className="text-slate-400 text-base">
            Intelligent planning calibrated specifically for Southern Sri Lanka's road networks.
          </p>
        </div>

        {/* Bento Grid Story */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Bento Item 1: Tell Us Where You Want To Go (Span 7) */}
          <div className="lg:col-span-7 bento-card p-6 sm:p-8 flex flex-col justify-between">
            <div className="glow-bloom w-72 h-72 -top-10 -right-10 bg-teal-500/15" />
            <div className="space-y-3 mb-6 relative z-10">
              <span className="text-xs font-mono font-bold text-primary-400 tracking-wider uppercase">01 / Selection</span>
              <h3 className="text-2xl font-bold text-slate-100">
                Tell us where you want to go. We handle the rest.
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed max-w-lg">
                Pick your preferred spots from 10 verified destinations around Walasmulla. Filter by sacred heritage caves, golden surf beaches, or tranquil nature sanctuaries with one tap.
              </p>
            </div>

            {/* 4-Photo Collage */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 relative z-10">
              <div className="group relative rounded-xl overflow-hidden aspect-square border border-white/10">
                <img
                  src="https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=400&q=80"
                  alt="Mulkirigala"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex items-end p-2">
                  <span className="text-[11px] font-semibold text-white">Mulkirigala</span>
                </div>
              </div>

              <div className="group relative rounded-xl overflow-hidden aspect-square border border-white/10">
                <img
                  src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80"
                  alt="Tangalle"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex items-end p-2">
                  <span className="text-[11px] font-semibold text-white">Tangalle</span>
                </div>
              </div>

              <div className="group relative rounded-xl overflow-hidden aspect-square border border-white/10">
                <img
                  src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=400&q=80"
                  alt="Hummanaya"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex items-end p-2">
                  <span className="text-[11px] font-semibold text-white">Hummanaya</span>
                </div>
              </div>

              <div className="group relative rounded-xl overflow-hidden aspect-square border border-white/10">
                <img
                  src="https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?auto=format&fit=crop&w=400&q=80"
                  alt="Rekawa"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex items-end p-2">
                  <span className="text-[11px] font-semibold text-white">Rekawa</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bento Item 2: No Templates. Just your trip (Span 5) */}
          <div className="lg:col-span-5 bento-card p-6 sm:p-8 flex flex-col justify-between">
            <div className="glow-bloom w-64 h-64 -bottom-10 -left-10 bg-indigo-500/15" />
            <div className="space-y-3 relative z-10">
              <span className="text-xs font-mono font-bold text-teal-400 tracking-wider uppercase">02 / Algorithmic Routing</span>
              <h3 className="text-2xl font-bold text-slate-100">
                No Templates. Just your trip.
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Our greedy nearest-neighbor solver computes the optimal sequence of stops directly from Walasmulla Clock Tower, avoiding backtracking and minimizing transit fatigue.
              </p>
            </div>

            <div className="mt-6 p-4 rounded-2xl bg-[#07090e] border border-white/10 space-y-2 relative z-10">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="font-semibold text-teal-300">Hub: Walasmulla</span>
                <span className="font-mono text-slate-400">6.1528°N, 80.6981°E</span>
              </div>
              <div className="flex items-center gap-2 text-xs py-1.5 px-2.5 rounded-lg bg-white/5 border border-white/10 text-teal-300">
                <Navigation size={13} />
                <span>Auto-calculated driving matrix with real-time ETA tags</span>
              </div>
            </div>
          </div>

          {/* Bento Item 3: Plan on the Go (Span 12) */}
          <div className="lg:col-span-12 bento-card p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="glow-bloom w-80 h-80 -top-20 -left-20 bg-emerald-500/10" />
            <div className="space-y-3 max-w-xl relative z-10">
              <span className="text-xs font-mono font-bold text-emerald-400 tracking-wider uppercase">03 / Mobile Readiness</span>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-100">
                Plan Together, Travel on the Go!
              </h3>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                Access your custom plans seamlessly on your smartphone during your tour. View directions, opening hours, and remaining daylight hours right from your palm.
              </p>
              <div className="flex items-center gap-4 pt-2">
                <Link to="/planner" className="btn-primary text-sm px-5 py-2.5">
                  Launch Day Planner <ChevronRight size={16} />
                </Link>
                <Link to="/my-plans" className="btn-secondary text-sm px-5 py-2.5 bg-white/5 border-white/10 hover:bg-white/10">
                  View Saved Plans
                </Link>
              </div>
            </div>

            {/* Visual Pocket Device Card */}
            <div className="relative z-10 w-full sm:w-80 p-4 rounded-2xl bg-[#07090e] border border-white/10 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs text-slate-400">
                <span>📱 Pocket Navigator</span>
                <span className="text-emerald-400 font-mono">08:00 - 18:00</span>
              </div>
              <div className="py-3 space-y-2 text-xs">
                <div className="p-2 rounded bg-white/5 flex items-center justify-between">
                  <span className="text-slate-200">1. Mulkirigala Temple</span>
                  <span className="text-teal-400 font-mono">11 km</span>
                </div>
                <div className="p-2 rounded bg-white/5 flex items-center justify-between">
                  <span className="text-slate-200">2. Tangalle Beach</span>
                  <span className="text-teal-400 font-mono">19 km</span>
                </div>
                <div className="p-2 rounded bg-white/5 flex items-center justify-between">
                  <span className="text-slate-200">3. Rekawa Turtle Bay</span>
                  <span className="text-teal-400 font-mono">22 km</span>
                </div>
              </div>
              <div className="text-[11px] text-slate-400 text-center pt-2 border-t border-white/10">
                All stops verified within 25 km boundary
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 3. ONE CIRCUIT FOR EVERY ADVENTURE (2x2 GLOWING BENTO GRID) */}
      {/* ─────────────────────────────────────────────────────────── */}
      <section className="page-container py-16">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-teal-300 text-xs font-semibold uppercase tracking-wider">
            <span>Circuit Pillars</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
            One Circuit for Every Adventure
          </h2>
          <p className="text-slate-400 text-base">
            From sacred heritage caves to protected marine reserves, discover southern richness within minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Sacred Heritage */}
          <div className="bento-card p-8 group">
            <div className="glow-bloom w-64 h-64 -top-10 -left-10 bg-primary-600/10 group-hover:bg-primary-500/20 transition-all duration-500" />
            <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#10141f] border border-white/10 flex items-center justify-center text-primary-300 shadow-lg">
                <Mountain size={24} />
              </div>
              <h3 className="text-2xl font-bold text-slate-100">
                Sacred Heritage & Cave Temples
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Centuries-old rock shrines such as Mulkirigala Raja Maha Viharaya, Ramba Viharaya, and Kasagala. Climb ancient rock staircases adorned with Kandyan wall murals and sacred reclining Buddhas.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs text-primary-400 font-semibold">
                <span>Mulkirigala · Kasagala · Ramba Viharaya</span>
              </div>
            </div>
          </div>

          {/* Card 2: Coastal Bays */}
          <div className="bento-card p-8 group">
            <div className="glow-bloom w-64 h-64 -top-10 -right-10 bg-teal-500/10 group-hover:bg-teal-400/20 transition-all duration-500" />
            <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#10141f] border border-white/10 flex items-center justify-center text-teal-300 shadow-lg">
                <Waves size={24} />
              </div>
              <h3 className="text-2xl font-bold text-slate-100">
                Coastal Bays & Natural Wonders
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Pristine golden sands along Tangalle and Goyambokka, coupled with the natural power of the Hummanaya sea blowhole. Feel ocean breezes and witness dramatic coastal rock formations.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs text-teal-400 font-semibold">
                <span>Tangalle Beach · Hummanaya Blowhole</span>
              </div>
            </div>
          </div>

          {/* Card 3: Wildlife Sanctuaries */}
          <div className="bento-card p-8 group">
            <div className="glow-bloom w-64 h-64 -bottom-10 -left-10 bg-emerald-600/10 group-hover:bg-emerald-500/20 transition-all duration-500" />
            <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#10141f] border border-white/10 flex items-center justify-center text-emerald-300 shadow-lg">
                <Feather size={24} />
              </div>
              <h3 className="text-2xl font-bold text-slate-100">
                Wildlife & Marine Sanctuaries
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Observe sea turtles in their natural habitat at Rekawa Turtle Watch and cruise through tranquil mangrove lagoons with 150+ bird species at Kalametiya Ramsar Sanctuary.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                <span>Rekawa Turtles · Kalametiya Wetlands</span>
              </div>
            </div>
          </div>

          {/* Card 4: Algorithmic Engine */}
          <div className="bento-card p-8 group">
            <div className="glow-bloom w-64 h-64 -bottom-10 -right-10 bg-indigo-600/10 group-hover:bg-indigo-500/20 transition-all duration-500" />
            <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#10141f] border border-white/10 flex items-center justify-center text-indigo-300 shadow-lg">
                <Navigation size={24} />
              </div>
              <h3 className="text-2xl font-bold text-slate-100">
                Greedy Nearest-Neighbor Engine
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Instant travel calculation tailored for Southern Sri Lanka. Automatically arranges your daily itinerary to optimize distance, respect operating hours, and prevent unnecessary fatigue.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs text-indigo-400 font-semibold">
                <span>Shortest Circuit · Daylight Safeguard (08:00–18:00)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 4. INSPIRE YOUR ADVENTURE (INTERACTIVE DESTINATION SHOWCASE) */}
      {/* ─────────────────────────────────────────────────────────── */}
      <section className="page-container py-16">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-teal-300 text-xs font-semibold uppercase tracking-wider">
            <span>Interactive Showcase</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
            Inspire Your Adventure
          </h2>
          <p className="text-slate-400 text-base">
            Select any destination below to preview travel metrics, timings and highlights.
          </p>
        </div>

        {/* Grand Showcase Card */}
        <div
          className="bento-card overflow-hidden lg:h-[480px]"
          onMouseEnter={() => setIsDestPaused(true)}
          onMouseLeave={() => setIsDestPaused(false)}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 h-full">
            {/* Left Image Showcase - strictly locked aspect/dimensions, cross-faded */}
            <div className="lg:col-span-7 relative h-[280px] sm:h-[360px] lg:h-full overflow-hidden bg-black/50">
              {SHOWCASE_DESTINATIONS.map((dest, idx) => (
                <div
                  key={dest.id}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    idx === activeDestIdx
                      ? 'opacity-100 z-10'
                      : 'opacity-0 z-0 pointer-events-none'
                  }`}
                >
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              ))}
              <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#07090e]" />
              <div className="absolute top-4 left-4 z-30 flex gap-2">
                <span className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-xs font-semibold text-teal-300">
                  {activeDestination.category}
                </span>
                <span className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-teal-500/40 text-xs font-mono text-teal-300">
                  {activeDestination.distanceKm} km from Walasmulla
                </span>
              </div>
            </div>

            {/* Right Details Panel - locked height, neat spacing */}
            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-[#07090e] border-t lg:border-t-0 lg:border-l border-white/10 h-full overflow-hidden">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock size={14} className="text-teal-400" />
                  <span>Suggested Stay: {activeDestination.duration}</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-100 transition-all duration-300">
                  {activeDestination.name}
                </h3>

                <p className="text-slate-300 text-sm leading-relaxed min-h-[4.5rem]">
                  {activeDestination.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {activeDestination.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 flex items-center justify-between gap-3">
                <Link
                  to={`/places/${activeDestination.id}`}
                  className="btn-secondary text-sm px-4 py-2 bg-white/5 border-white/10 hover:bg-white/10"
                >
                  View Details
                </Link>
                <Link
                  to="/planner"
                  className="btn-primary text-sm px-5 py-2 shadow-glow"
                >
                  Add to Day Plan <ChevronRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Thumbnail Selector Row */}
        <div
          className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4"
          onMouseEnter={() => setIsDestPaused(true)}
          onMouseLeave={() => setIsDestPaused(false)}
        >
          {SHOWCASE_DESTINATIONS.map((dest, idx) => (
            <button
              key={dest.id}
              onClick={() => setActiveDestIdx(idx)}
              className={`p-2.5 rounded-2xl border text-left transition-all duration-300 flex items-center gap-3 relative overflow-hidden ${
                idx === activeDestIdx
                  ? 'bg-teal-500/10 border-teal-500 shadow-glow'
                  : 'bg-[#07090e] border-white/10 hover:border-slate-500'
              }`}
            >
              <img
                src={dest.image}
                alt={dest.name}
                className="w-10 h-10 rounded-xl object-cover shrink-0"
              />
              <div className="truncate">
                <h4 className="text-xs font-semibold text-slate-200 truncate">{dest.name}</h4>
                <span className="text-[11px] text-teal-400 font-mono">{dest.distanceKm} km</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 5. READY TO EXPLORE & 1:1 TOUR MAP RADAR SECTION             */}
      {/* ─────────────────────────────────────────────────────────── */}
      <section className="page-container py-16">
        <div className="relative overflow-hidden rounded-3xl bg-[#07090e] border border-white/10 p-8 sm:p-10 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-12">
            {/* Left Column: Text & CTAs */}
            <div className="lg:col-span-6 space-y-4 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-teal-300 text-xs font-semibold">
                <Compass size={13} className="animate-spin-slow" />
                <span>Smart Day Circuit · Walasmulla 25 km</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-100">
                Ready to explore <span className="text-gradient">Walasmulla?</span>
              </h2>

              <p className="text-slate-400 text-sm sm:text-base max-w-xl leading-relaxed">
                Add your favorite cultural spots, beaches and viewpoints to your custom day itinerary in seconds. Discover all 10 curated destinations with automatic route optimization.
              </p>

              {/* Quick feature perks - neatly grouped close together */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 pb-1 text-xs text-slate-300">
                <div className="inline-flex items-center gap-1.5 font-medium">
                  <span className="text-teal-400 font-bold">✓</span>
                  <span>10 Curated Spots</span>
                </div>
                <div className="inline-flex items-center gap-1.5 font-medium">
                  <span className="text-teal-400 font-bold">✓</span>
                  <span>25 km Circuit</span>
                </div>
                <div className="inline-flex items-center gap-1.5 font-medium">
                  <span className="text-teal-400 font-bold">✓</span>
                  <span>Shortest Route Calc</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link to="/planner" className="btn-primary px-6 py-2.5">
                  <Calendar size={18} /> Open Day Planner
                </Link>
                <Link to="/places" className="btn-secondary px-6 py-2.5 bg-white/5 border-white/10 hover:bg-white/10">
                  Browse 10+ Places
                </Link>
              </div>
            </div>

            {/* Right Column: Tour Map Radar Widget */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center">
              <TourMapWidget />
              <span className="text-xs text-slate-500 mt-2.5">
                Click map to expand 3D radar
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 6. HAVE QUESTIONS? (COLLAPSIBLE FAQ ACCORDION)               */}
      {/* ─────────────────────────────────────────────────────────── */}
      <section className="page-container py-16">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-teal-300 text-xs font-semibold uppercase tracking-wider">
            <span>Support & Guidance</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
            Have Questions?
          </h2>
          <p className="text-slate-400 text-base">
            Everything you need to know about navigating Southern Sri Lanka and using our planner.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={faq.q}
                className="rounded-2xl border border-white/10 bg-[#07090e] backdrop-blur-md overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 text-slate-100 font-semibold hover:text-teal-300 transition-colors"
                >
                  <span className="text-sm sm:text-base">{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-slate-400 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-teal-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-slate-300 text-sm leading-relaxed border-t border-white/10 animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 7. CALL TO ACTION (MATCHING "HOW IT WORKS" BENTO AESTHETIC) */}
      {/* ─────────────────────────────────────────────────────────── */}
      <section className="page-container py-16">
        <div className="bento-card relative overflow-hidden rounded-3xl p-10 sm:p-16 text-center shadow-2xl border border-white/10 bg-[#07090e]">
          {/* Subtle Cyber Radar Grid Overlay */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(20, 184, 166, 0.2) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(20, 184, 166, 0.2) 1px, transparent 1px)
              `,
              backgroundSize: '36px 36px',
            }}
          />

          {/* Dual Ambient Glow Blooms matching Bento theme */}
          <div className="glow-bloom w-96 h-96 -top-24 -left-24 bg-teal-500/15 pointer-events-none" />
          <div className="glow-bloom w-96 h-96 -bottom-24 -right-24 bg-primary-600/15 pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-950/80 border border-primary-800/40 text-primary-300 text-xs font-semibold uppercase tracking-wider">
              <Compass size={14} className="animate-spin-slow text-primary-400" />
              <span>Start Your Journey</span>
            </div>

            {/* Heading with Brand Gradient */}
            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-100 tracking-tight leading-tight">
              Partner with <span className="text-gradient">Your Tour Today</span>
            </h2>

            {/* Subtext */}
            <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Experience the best of Southern Sri Lanka with zero stress. Build your tailored day circuit, track mileage, and preserve every memory.
            </p>

            {/* Feature Pills Strip matching How It Works */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs text-slate-300">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <CheckCircle2 size={13} className="text-teal-400" />
                <span>10 Verified Stops</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <CheckCircle2 size={13} className="text-teal-400" />
                <span>25 km Circuit Boundary</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <CheckCircle2 size={13} className="text-teal-400" />
                <span>Shortest Route Calculation</span>
              </div>
            </div>

            {/* CTA Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3.5 justify-center items-center pt-3">
              <Link
                to="/planner"
                className="btn-primary text-base px-8 py-3.5 shadow-glow rounded-xl font-semibold flex items-center gap-2"
              >
                <Calendar size={18} />
                <span>Launch Day Planner</span>
                <ChevronRight size={16} />
              </Link>
              <Link
                to="/register"
                className="btn-secondary text-base px-8 py-3.5 bg-white/5 border-white/15 hover:bg-white/10 rounded-xl font-semibold transition-all"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Floating Scroll-to-Top Button ── */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Scroll to top"
        className={`fixed bottom-8 right-8 z-50 group flex items-center justify-center
          w-12 h-12 rounded-full
          bg-gradient-to-br from-primary to-accent
          shadow-lg shadow-primary/30
          border border-white/10
          transition-all duration-500 ease-out
          hover:scale-110 hover:shadow-xl hover:shadow-primary/40
          active:scale-95
          ${showScrollTop
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-6 pointer-events-none'
          }`}
      >
        <ArrowUp
          size={22}
          className="text-white transition-transform duration-300 group-hover:-translate-y-0.5"
        />
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-30 pointer-events-none" />
      </button>

    </div>
  );
}
