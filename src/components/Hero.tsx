import React from 'react';
import { ArrowDown, ArrowRight, ShieldCheck, Sparkles, BookOpen, Heart, Users } from 'lucide-react';
import { BrandLogo } from '../brand/BrandLogo';
import { SITE_CONFIG } from '../config/siteConfig';

export const Hero: React.FC = () => {
  return (
    <section
      id="home"
      className="relative min-h-[760px] lg:min-h-[820px] flex items-center justify-center pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden w-full"
    >
      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center w-full">
          
          {/* Left Column: Editorial Headline & Purpose */}
          <div className="lg:col-span-7 min-w-0 text-left space-y-6 sm:space-y-8">
            
            {/* Top Pill / Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-slate-200/80 shadow-xs backdrop-blur-md max-w-full">
              <span className="flex h-2 w-2 rounded-full bg-[#125EA2] animate-pulse shrink-0" />
              <span className="text-xs font-semibold tracking-wider uppercase text-slate-700 truncate">
                {SITE_CONFIG.hero.badge}
              </span>
              <span className="text-slate-300 hidden sm:inline">|</span>
              <span className="text-xs font-medium text-slate-500 hidden sm:inline">Technology • Education • Social Impact</span>
            </div>

            {/* Main Editorial Headline */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.12] sm:leading-[1.08] break-words">
                <span className="block text-slate-900">Leading Today,</span>
                <span className="block bg-gradient-to-r from-[#125EA2] via-[#0E7490] to-[#388E3C] bg-clip-text text-transparent">
                  Shaping Tomorrow.
                </span>
              </h1>
            </div>

            {/* Concise Mission Introduction */}
            <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl leading-relaxed font-normal">
              {SITE_CONFIG.hero.subtext}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 pt-2">
              <a
                href="#about"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full text-base font-semibold text-white bg-[#125EA2] hover:bg-[#0E4F8B] shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98] group"
              >
                <span>{SITE_CONFIG.hero.primaryCta}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>

              <a
                href="#contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-base font-semibold text-slate-700 bg-white/90 hover:bg-white border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-sm transition-all duration-200"
              >
                <span>{SITE_CONFIG.hero.secondaryCta}</span>
              </a>
            </div>

            {/* Core Values Strip */}
            <div className="pt-6 border-t border-slate-200/70 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-600 truncate">
                <span className="p-1.5 rounded-lg bg-[#125EA2]/10 text-[#125EA2] shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </span>
                <span className="truncate">Technology</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-600 truncate">
                <span className="p-1.5 rounded-lg bg-[#388E3C]/10 text-[#388E3C] shrink-0">
                  <BookOpen className="w-3.5 h-3.5" />
                </span>
                <span className="truncate">Education</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-600 truncate">
                <span className="p-1.5 rounded-lg bg-[#ED2924]/10 text-[#ED2924] shrink-0">
                  <Heart className="w-3.5 h-3.5" />
                </span>
                <span className="truncate">Social Services</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-600 truncate">
                <span className="p-1.5 rounded-lg bg-[#FFA726]/10 text-[#D97706] shrink-0">
                  <Users className="w-3.5 h-3.5" />
                </span>
                <span className="truncate">Community</span>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Visual Composition */}
          <div className="lg:col-span-5 min-w-0 flex justify-center lg:justify-end w-full">
            <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-none">
              
              {/* Outer decorative glow rings */}
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-[#125EA2]/10 via-[#388E3C]/10 to-[#FFA726]/10 blur-xl opacity-70 -z-10" />

              {/* Main Visual Showcase Card */}
              <div className="glass-card rounded-3xl p-5 sm:p-8 lg:p-10 shadow-xl border border-white/70 relative overflow-hidden">
                
                {/* Subtle background brand watermark */}
                <div className="absolute -right-8 -bottom-8 opacity-5 pointer-events-none">
                  <BrandLogo variant="mark" size="xl" className="w-64 h-64" />
                </div>

                {/* Center Brand Identity Composition */}
                <div className="flex flex-col items-center text-center space-y-5 sm:space-y-6">
                  
                  {/* Official Emblem with clean floating presentation */}
                  <div className="relative p-4 sm:p-6 rounded-2xl bg-white shadow-md border border-slate-100 transition-transform duration-500 hover:scale-105">
                    <BrandLogo variant="mark" size="lg" className="h-20 w-20 sm:h-28 sm:w-28 lg:h-32 lg:w-32" />
                  </div>

                  {/* Official Wordmark & Tagline Lockup */}
                  <div className="space-y-1 w-full max-w-xs">
                    <img
                      src="/brand/logo-wordmark.png"
                      alt="NextGen — Leading Today, Shaping Tomorrow"
                      className="h-8 sm:h-10 lg:h-12 w-auto object-contain mx-auto"
                    />
                  </div>

                  <p className="text-xs text-slate-500 max-w-xs leading-relaxed font-normal">
                    A registered multidisciplinary identity uniting innovation, learning, and civic responsibility.
                  </p>

                  {/* 4 Quadrants Pill Matrix */}
                  <div className="w-full grid grid-cols-2 gap-2 sm:gap-2.5 pt-4 border-t border-slate-100 text-left">
                    <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-100/80 min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#125EA2] shrink-0" />
                        <span className="text-xs font-semibold text-slate-800 truncate">Innovation</span>
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 truncate">Digital tools & systems</p>
                    </div>

                    <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-100/80 min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#388E3C] shrink-0" />
                        <span className="text-xs font-semibold text-slate-800 truncate">Knowledge</span>
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 truncate">Practical learning</p>
                    </div>

                    <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-100/80 min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#ED2924] shrink-0" />
                        <span className="text-xs font-semibold text-slate-800 truncate">Compassion</span>
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 truncate">Public welfare</p>
                    </div>

                    <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-100/80 min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#FFA726] shrink-0" />
                        <span className="text-xs font-semibold text-slate-800 truncate">Cohesion</span>
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 truncate">Community support</p>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Subtle Scroll Indicator */}
        <div className="mt-14 lg:mt-20 flex justify-center">
          <a
            href="#about"
            className="group flex flex-col items-center gap-2 text-xs font-medium text-slate-400 hover:text-slate-700 transition-colors"
            aria-label="Scroll to About section"
          >
            <span>Explore NextGen</span>
            <span className="p-1.5 rounded-full border border-slate-200 group-hover:border-slate-400 transition-colors animate-bounce">
              <ArrowDown className="w-3.5 h-3.5 text-slate-500" />
            </span>
          </a>
        </div>

      </div>
    </section>
  );
};
