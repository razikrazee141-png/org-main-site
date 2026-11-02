import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export const ScrollProgress: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
      }
      setIsVisible(window.scrollY > 280);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // SVG circular progress calculation
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <div
      className={`fixed bottom-6 right-6 z-40 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-4 scale-90 pointer-events-none'
      }`}
    >
      <button
        type="button"
        onClick={scrollToTop}
        className="relative group w-12 h-12 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-[#125EA2] shadow-lg hover:shadow-xl border border-slate-200/80 backdrop-blur-md flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer"
        aria-label="Scroll back to top"
        title={`Scroll to top (${Math.round(scrollProgress)}%)`}
      >
        {/* Circular SVG Progress Ring */}
        <svg className="w-12 h-12 absolute inset-0 -rotate-90 pointer-events-none" viewBox="0 0 44 44">
          {/* Background circle */}
          <circle
            cx="22"
            cy="22"
            r={radius}
            className="text-slate-200/60"
            strokeWidth="2.5"
            stroke="currentColor"
            fill="transparent"
          />
          {/* Progress fill circle */}
          <circle
            cx="22"
            cy="22"
            r={radius}
            className="text-[#125EA2] transition-all duration-75"
            strokeWidth="2.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
          />
        </svg>

        <ArrowUp className="w-4 h-4 transition-transform duration-200 group-hover:-translate-y-0.5" />
      </button>
    </div>
  );
};
