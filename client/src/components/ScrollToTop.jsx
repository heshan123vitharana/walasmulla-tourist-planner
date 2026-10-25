/**
 * ScrollToTop.jsx — Universal Floating Back-to-Top Button.
 * Appears dynamically in bottom-right corner when scrolling down (> 250px).
 * Provides smooth animated scroll-to-top and route change auto-reset.
 */
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const location = useLocation();

  // Scroll to top automatically when navigating between pages
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  // Monitor window scroll depth
  useEffect(() => {
    const handleScroll = () => {
      // Show when scrolled down more than 250px
      const scrolled = window.scrollY || document.documentElement.scrollTop;
      setVisible(scrolled > 250);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      title="Back to top"
      aria-label="Back to top"
      style={{
        position: 'fixed',
        bottom: '28px',
        right: '28px',
        zIndex: 9999,
      }}
      className={`group flex items-center justify-center
        w-12 h-12 rounded-full
        bg-gradient-to-tr from-teal-600 via-primary-500 to-teal-400
        text-white
        border border-white/30
        shadow-[0_8px_25px_rgba(20,184,166,0.55)]
        cursor-pointer select-none
        transition-all duration-300 ease-out
        hover:scale-110 hover:shadow-[0_10px_35px_rgba(20,184,166,0.75)] hover:border-white/60
        active:scale-95
        focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-slate-950
        ${visible
          ? 'opacity-100 translate-y-0 pointer-events-auto scale-100'
          : 'opacity-0 translate-y-6 pointer-events-none scale-75'
        }`}
    >
      <ArrowUp
        size={22}
        className="stroke-[2.5] text-white transition-transform duration-200 group-hover:-translate-y-0.5"
      />
    </button>
  );
}
