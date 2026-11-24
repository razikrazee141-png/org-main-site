import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, Award, ShieldCheck } from 'lucide-react';
import { SITE_CONFIG } from '../config/siteConfig';

export const DirectorsShowcase: React.FC = () => {
  const directors = SITE_CONFIG.about.directors;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const INTERVAL_DURATION = 4500; // 4.5s per director
  const TICK_INTERVAL = 30; // Smooth tick

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
      className="mt-14 sm:mt-20 pt-12 sm:pt-16 border-t border-slate-300/80 relative"
      aria-label="NextGen Board of Directors"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10 reveal">
        <div className="space-y-2">
          <div className="biztop-eyebrow">
            <ShieldCheck className="w-3.5 h-3.5 text-[#06302B]" />
            <span>{SITE_CONFIG.about.directorsBadge}</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0B2B26]">
            {SITE_CONFIG.about.directorsHeading}
          </h3>
          <p className="text-sm sm:text-base text-[#5B6B66] max-w-2xl font-normal">
            {SITE_CONFIG.about.directorsSubtext}
          </p>
        </div>

        {/* Play/Pause & Arrow Navigation Controls with 44x44px Touch Targets */}
        <div className="flex items-center gap-2">
          {/* Indicator Dots */}
          <div className="hidden sm:flex items-center gap-1.5 mr-2" aria-hidden="true">
            {directors.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectDirector(idx)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentIndex
                    ? 'w-6 bg-[#06302B]'
                    : 'w-2 bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`Go to director ${idx + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              className="w-11 h-11 flex items-center justify-center p-0 rounded-full border border-slate-300 hover:bg-[#B4F26B] hover:border-[#B4F26B] text-[#06302B] transition-colors cursor-pointer touch-manipulation active:scale-95"
              aria-label="Previous Director"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              className="w-11 h-11 flex items-center justify-center p-0 rounded-full border border-slate-300 hover:bg-[#B4F26B] hover:border-[#B4F26B] text-[#06302B] transition-colors cursor-pointer touch-manipulation active:scale-95"
              aria-label={isPaused ? 'Resume auto-play' : 'Pause auto-play'}
              title={isPaused ? 'Resume auto-transition' : 'Pause auto-transition'}
            >
              {isPaused ? <Play className="w-4 h-4 text-[#06302B]" /> : <Pause className="w-4 h-4 text-slate-500" />}
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="w-11 h-11 flex items-center justify-center p-0 rounded-full border border-slate-300 hover:bg-[#B4F26B] hover:border-[#B4F26B] text-[#06302B] transition-colors cursor-pointer touch-manipulation active:scale-95"
              aria-label="Next Director"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Rotating Showcase Stage on Deep Green with Lime Highlights */}
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        className="relative rounded-[24px] sm:rounded-[28px] bg-[#06302B] text-white p-5 sm:p-8 lg:p-12 shadow-2xl overflow-hidden border border-[#0A3D37] reveal-scale reveal-delay-1"
      >
        {/* Animated Lime Progress Bar along the top */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/10 overflow-hidden z-20">
          <div
            className="h-full bg-gradient-to-r from-[#B4F26B] via-[#E4FFB0] to-[#B4F26B] shadow-[0_0_12px_#B4F26B] transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
          
          {/* Uniform 24px Rounded Photo Frame with Lime Outline & Smooth 700-800ms Transition */}
          <div className="md:col-span-5 flex justify-center">
            <div className="relative group/photo w-full flex justify-center">
              
              {/* Soft Lime Glow behind the Active Frame */}
              <div className="absolute -inset-3 rounded-[28px] bg-[#B4F26B]/25 blur-xl pointer-events-none animate-pulse-glow" />

              {/* Uniform Frame Container: 24px Radius, Zero Layout Shift */}
              <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-[4/5] rounded-[24px] overflow-hidden bg-slate-900 border-2 border-[#B4F26B] shadow-2xl transition-transform duration-500 group-hover/photo:scale-[1.02]">
                {directors.map((director, index) => {
                  const isActive = index === currentIndex;
                  return (
                    <div
                      key={director.id}
                      className={`absolute inset-0 transition-all duration-700 sm:duration-800 ease-[cubic-bezier(.22,.61,.36,1)] ${
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
                      <div className="absolute inset-0 bg-gradient-to-t from-[#06302B]/80 via-transparent to-transparent pointer-events-none" />
                    </div>
                  );
                })}

                {/* Official Verified Emblem Tag */}
                <div className="absolute bottom-3 right-3 z-20 px-3 py-1 rounded-full bg-[#B4F26B] text-[#06302B] shadow-md flex items-center gap-1.5 text-[11px] font-bold">
                  <Award className="w-3.5 h-3.5 text-[#06302B]" />
                  <span>NextGen Governance</span>
                </div>
              </div>

            </div>
          </div>

          {/* Director Information & Narrative */}
          <div className="md:col-span-7 relative min-h-[220px] flex flex-col justify-center text-left">
            {directors.map((director, index) => {
              const isActive = index === currentIndex;
              return (
                <div
                  key={director.id}
                  className={`transition-all duration-700 sm:duration-800 ease-[cubic-bezier(.22,.61,.36,1)] ${
                    isActive
                      ? 'opacity-100 translate-y-0 relative z-10'
                      : 'opacity-0 translate-y-4 absolute inset-0 pointer-events-none z-0'
                  } space-y-3 sm:space-y-4`}
                >
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#B4F26B] font-mono">
                      <span>Executive Board of Directors</span>
                    </div>

                    <h4 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                      {director.name}
                    </h4>

                    {/* Small Lime Pill for Designation */}
                    <div className="pt-1">
                      <span className="inline-block px-3 py-1 rounded-full bg-[#B4F26B]/20 text-[#B4F26B] text-xs font-bold tracking-wide border border-[#B4F26B]/30">
                        {director.role}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal max-w-xl">
                    Serving on the governing board of NextGen to steer multidisciplinary operations, uphold institutional ethics, and expand impactful initiatives across software services, education, social services, and community welfare.
                  </p>

                  {/* Governance Pillars Pill Row */}
                  <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-slate-200">
                      Institutional Leadership
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-slate-200">
                      Strategic Vision
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-slate-200">
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
