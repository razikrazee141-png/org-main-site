import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, Award, ShieldCheck } from 'lucide-react';
import { SITE_CONFIG } from '../config/siteConfig';

export const DirectorsShowcase: React.FC = () => {
  const directors = SITE_CONFIG.about.directors;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const INTERVAL_DURATION = 2000; // Exactly 2 seconds per director
  const TICK_INTERVAL = 20; // 50fps ultra-smooth progress tick

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentIndex((idx) => (idx + 1) % directors.length);
          return 0;
        }
        return prev + (TICK_INTERVAL / INTERVAL_DURATION) * 100;
      });
    }, TICK_INTERVAL);

    return () => clearInterval(timer);
  }, [isPaused, directors.length]);

  const handleSelectDirector = (index: number) => {
    setCurrentIndex(index);
    setProgress(0);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + directors.length) % directors.length);
    setProgress(0);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % directors.length);
    setProgress(0);
  };

  return (
    <div
      className="mt-20 pt-16 border-t border-slate-200/80 relative"
      aria-label="NextGen Board of Directors"
    >
      {/* Header (No Serial Numbers) */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase text-[#125EA2] bg-[#125EA2]/10">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{SITE_CONFIG.about.directorsBadge}</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {SITE_CONFIG.about.directorsHeading}
          </h3>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl font-normal">
            {SITE_CONFIG.about.directorsSubtext}
          </p>
        </div>

        {/* Play/Pause & Arrow Navigation Controls (Clean, No Serial Number) */}
        <div className="flex items-center gap-2">
          {/* Subtle Indicator Dots */}
          <div className="hidden sm:flex items-center gap-1.5 mr-2" aria-hidden="true">
            {directors.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectDirector(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentIndex
                    ? 'w-6 bg-[#125EA2]'
                    : 'w-2 bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handlePrev}
            className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
            aria-label="Previous Director"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
            aria-label={isPaused ? 'Resume auto-play' : 'Pause auto-play'}
            title={isPaused ? 'Resume auto-transition' : 'Pause auto-transition'}
          >
            {isPaused ? <Play className="w-4 h-4 text-[#125EA2]" /> : <Pause className="w-4 h-4 text-slate-500" />}
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
            aria-label="Next Director"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Rotating Showcase Stage with Cinematic Transitions */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-[#0B1528] to-[#12284C] text-white p-6 sm:p-10 lg:p-12 shadow-2xl overflow-hidden border border-slate-800">
        
        {/* Subtle background ambient brand glow */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#125EA2]/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[#388E3C]/15 blur-3xl pointer-events-none" />

        {/* Animated Progress Bar along the top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 overflow-hidden z-20">
          <div
            className="h-full bg-gradient-to-r from-[#125EA2] via-sky-400 to-[#388E3C] transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
          
          {/* Animated Director Portrait Stage (Smooth Crossfade & Zoom) */}
          <div className="md:col-span-5 flex justify-center">
            <div className="relative group/photo">
              
              {/* Outer decorative ambient glow */}
              <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-[#125EA2] via-[#388E3C] to-[#FFA726] opacity-35 blur-md" />

              {/* Layered Image Container: All 5 images stay mounted for fluid, instant crossfade */}
              <div className="relative w-64 h-80 sm:w-72 sm:h-96 rounded-2xl overflow-hidden bg-slate-900 border-2 border-white/20 shadow-2xl">
                {directors.map((director, index) => {
                  const isActive = index === currentIndex;
                  return (
                    <div
                      key={director.id}
                      className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                        isActive
                          ? 'opacity-100 scale-100 z-10 pointer-events-auto'
                          : 'opacity-0 scale-105 z-0 pointer-events-none'
                      }`}
                    >
                      <img
                        src={director.image}
                        alt={`${director.name} - ${director.role}`}
                        className="w-full h-full object-cover object-top"
                        loading="eager"
                      />
                      {/* Gradient shadow for depth */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent pointer-events-none" />
                    </div>
                  );
                })}

                {/* Official Verified Emblem Tag */}
                <div className="absolute bottom-3 right-3 z-20 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-slate-900 shadow-md flex items-center gap-1.5 text-[11px] font-bold">
                  <Award className="w-3.5 h-3.5 text-[#125EA2]" />
                  <span>NextGen Governance</span>
                </div>
              </div>
            </div>
          </div>

          {/* Director Information & Narrative (Smooth Text Crossfade) */}
          <div className="md:col-span-7 relative min-h-[220px] flex flex-col justify-center text-left">
            {directors.map((director, index) => {
              const isActive = index === currentIndex;
              return (
                <div
                  key={director.id}
                  className={`transition-all duration-400 ease-in-out ${
                    isActive
                      ? 'opacity-100 translate-y-0 relative z-10'
                      : 'opacity-0 translate-y-3 absolute inset-0 pointer-events-none z-0'
                  } space-y-4 sm:space-y-6`}
                >
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Executive Board of Directors</span>
                    </div>

                    <h4 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                      {director.name}
                    </h4>

                    <p className="text-lg sm:text-xl font-semibold text-emerald-400">
                      {director.role}
                    </p>
                  </div>

                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal max-w-xl">
                    Serving on the governing board of NextGen to steer multidisciplinary operations, uphold institutional ethics, and expand impactful initiatives across technology, education, social services, and community welfare.
                  </p>

                  {/* Governance Pillars Pill Row */}
                  <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-3 py-1 rounded-lg bg-white/10 border border-white/15 text-slate-200">
                      Institutional Leadership
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-white/10 border border-white/15 text-slate-200">
                      Strategic Vision
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-white/10 border border-white/15 text-slate-200">
                      Community Representation
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </div>
  );
};
