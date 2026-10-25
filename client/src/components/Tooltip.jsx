/**
 * Tooltip.jsx — Accessible, elegant hover/focus tooltip with smooth micro-animations.
 */
import React, { useState, useRef } from 'react';

export default function Tooltip({
  content,
  children,
  position = 'top',
  delay = 100,
  className = '',
}) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);

  if (!content) return children;

  function handleMouseEnter() {
    timerRef.current = setTimeout(() => {
      setVisible(true);
    }, delay);
  }

  function handleMouseLeave() {
    clearTimeout(timerRef.current);
    setVisible(false);
  }

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }[position] || 'bottom-full left-1/2 -translate-x-1/2 mb-2';

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-slate-800 border-x-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-slate-800 border-x-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-slate-800 border-y-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-slate-800 border-y-transparent border-l-transparent',
  }[position] || 'top-full left-1/2 -translate-x-1/2 border-t-slate-800 border-x-transparent border-b-transparent';

  return (
    <div
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {children}

      {visible && (
        <div
          role="tooltip"
          className={`absolute z-50 pointer-events-none whitespace-nowrap px-2.5 py-1 text-[11px] font-medium tracking-wide text-slate-100 bg-slate-900/95 border border-white/10 rounded-lg shadow-xl shadow-black/60 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 ${positionClasses}`}
        >
          {content}
          <div className={`absolute border-4 w-0 h-0 ${arrowClasses}`} />
        </div>
      )}
    </div>
  );
}
