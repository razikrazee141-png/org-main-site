import React, { useState } from 'react';
import { ArrowDown, ArrowRight, ShieldCheck, CheckCircle2, Mail, Building2 } from 'lucide-react';
import { BrandLogo } from '../brand/BrandLogo';
import { SITE_CONFIG } from '../config/siteConfig';

export const Hero: React.FC = () => {
  const [cardRotate, setCardRotate] = useState({ x: 0, y: 0 });

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setCardRotate({
      x: -(y / rect.height) * 7,
      y: (x / rect.width) * 7,
    });
  };

  const handleCardMouseLeave = () => {
    setCardRotate({ x: 0, y: 0 });
  };

  return (
    <section
      id="home"
      className="relative min-h-[780px] lg:min-h-[850px] flex items-center justify-center pt-28 sm:pt-32 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden w-full"
    >
      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center w-full">
          
          {/* Left Column: Editorial Headline & Purpose */}
          <div className="lg:col-span-7 min-w-0 text-left space-y-6 sm:space-y-8">
            
            {/* Top Pill / Official Institutional Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/90 border border-slate-200/90 shadow-[0_2px_10px_rgba(0,0,0,0.03)] backdrop-blur-md max-w-full hover:border-slate-300 transition-colors">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold tracking-wider uppercase text-slate-800 truncate">
                Official Institutional Portal
              </span>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <span className="text-xs font-medium text-slate-500 hidden sm:inline flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#125EA2]" />
                Registered Multidisciplinary Entity
              </span>
            </div>

            {/* Main Editorial Headline with Apple-Style Precision Typography */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.08] sm:leading-[1.05] break-words">
                <span className="block text-slate-900">Leading Today,</span>
                <span className="block bg-gradient-to-r from-[#125EA2] via-[#0284C7] to-[#16A34A] bg-clip-text text-transparent">
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
                href="#focus-areas"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full text-sm sm:text-base font-semibold text-white bg-[#125EA2] hover:bg-[#0E4F8B] shadow-md hover:shadow-xl hover:shadow-[#125EA2]/25 transition-all duration-200 active:scale-[0.98] group"
              >
                <span>Explore Disciplinary Scope</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>

              <a
                href="#contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-sm sm:text-base font-semibold text-slate-700 bg-white/95 hover:bg-white border border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-md transition-all duration-200 active:scale-[0.98]"
              >
                <Mail className="w-4 h-4 text-[#125EA2]" />
                <span>Contact Secretariat</span>
              </a>
            </div>

            {/* Official Key Institutional Indicators Strip */}
            <div className="pt-6 border-t border-slate-200/70 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="p-4 rounded-2xl bg-gradient-to-b from-white/95 to-slate-50/80 hover:to-white border border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#125EA2]" />
                  <div className="text-xl font-extrabold text-[#125EA2] font-mono leading-none">05</div>
                </div>
                <div className="text-xs font-semibold text-slate-900 mt-2">Focus Disciplines</div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">Tech, Edu & Civic Scope</div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-b from-white/95 to-slate-50/80 hover:to-white border border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#388E3C]" />
                  <div className="text-xl font-extrabold text-[#388E3C] font-mono leading-none">05</div>
                </div>
                <div className="text-xs font-semibold text-slate-900 mt-2">Board Directors</div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">Executive Governance</div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-b from-white/95 to-slate-50/80 hover:to-white border border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#ED2924]" />
                  <div className="text-xl font-extrabold text-[#ED2924] font-mono leading-none">100%</div>
                </div>
                <div className="text-xs font-semibold text-slate-900 mt-2">Grassroots Impact</div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">Community Centered</div>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Visual Showcase with Interactive 3D Card */}
          <div className="lg:col-span-5 min-w-0 flex justify-center lg:justify-end w-full">
            <div
              className="relative w-full max-w-sm sm:max-w-md lg:max-w-none transition-transform duration-200 ease-out"
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
              style={{
                transform: `perspective(1000px) rotateX(${cardRotate.x}deg) rotateY(${cardRotate.y}deg)`,
              }}
            >
              
              {/* Outer decorative multi-color glow */}
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-[#125EA2]/15 via-[#388E3C]/15 to-[#FFA726]/15 blur-2xl opacity-75 -z-10" />

              {/* Floating Pill Top Badge */}
              <div className="absolute -top-3.5 left-6 z-20 hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/95 border border-slate-200 shadow-md text-[11px] font-semibold text-slate-700 backdrop-blur-md">
                <Building2 className="w-3.5 h-3.5 text-[#125EA2]" />
                <span>NextGen Institutional Charter</span>
              </div>

              {/* Main Visual Showcase Card */}
              <div className="bg-white/95 rounded-3xl p-6 sm:p-8 lg:p-9 shadow-[0_20px_50px_rgba(0,0,0,0.07)] border border-slate-200/80 backdrop-blur-xl relative overflow-hidden">
                
                {/* Subtle background brand watermark */}
                <div className="absolute -right-8 -bottom-8 opacity-5 pointer-events-none">
                  <BrandLogo variant="mark" size="xl" className="w-64 h-64" />
                </div>

                {/* Center Brand Identity Composition */}
                <div className="flex flex-col items-center justify-center text-center space-y-4 sm:space-y-5">
                  
                  {/* Official Emblem with clean centered floating presentation */}
                  <div className="relative p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-white to-slate-50 shadow-md border border-slate-100 transition-transform duration-300 hover:scale-105 group mx-auto">
                    <BrandLogo variant="mark" size="lg" />
                  </div>

                  {/* Official Wordmark Lockup */}
                  <div className="flex items-center justify-center w-full max-w-xs mx-auto">
                    <img
                      src="/brand/logo-wordmark.png"
                      alt="NextGen — Leading Today, Shaping Tomorrow"
                      className="h-7 sm:h-8 lg:h-9 w-auto object-contain mx-auto block"
                    />
                  </div>

                  <p className="text-xs text-slate-500 max-w-xs leading-relaxed font-normal mx-auto">
                    A registered multidisciplinary organization uniting technical innovation, ethical education, and civic impact.
                  </p>

                  {/* 4 Quadrants Matrix with sleek hover highlights */}
                  <div className="w-full grid grid-cols-2 gap-2 sm:gap-2.5 pt-4 border-t border-slate-100 text-left">
                    <div className="p-3 rounded-2xl bg-slate-50/90 hover:bg-[#125EA2]/5 border border-slate-100 hover:border-[#125EA2]/25 transition-all group">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#125EA2] shrink-0" />
                        <span className="text-xs font-semibold text-slate-800">Innovation</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 truncate">Digital tools & systems</p>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50/90 hover:bg-[#388E3C]/5 border border-slate-100 hover:border-[#388E3C]/25 transition-all group">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#388E3C] shrink-0" />
                        <span className="text-xs font-semibold text-slate-800">Knowledge</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 truncate">Practical learning</p>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50/90 hover:bg-[#ED2924]/5 border border-slate-100 hover:border-[#ED2924]/25 transition-all group">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#ED2924] shrink-0" />
                        <span className="text-xs font-semibold text-slate-800">Compassion</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 truncate">Public welfare</p>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50/90 hover:bg-[#FFA726]/5 border border-slate-100 hover:border-[#FFA726]/25 transition-all group">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#FFA726] shrink-0" />
                        <span className="text-xs font-semibold text-slate-800">Community</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 truncate">Citizen engagement</p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Floating Bottom Badge */}
              <div className="absolute -bottom-3 right-6 z-20 hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 shadow-md text-[11px] font-semibold text-emerald-800 backdrop-blur-md">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Institutional Entity</span>
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
            <span className="p-2 rounded-full border border-slate-200 group-hover:border-slate-400 group-hover:bg-white shadow-xs transition-all animate-bounce">
              <ArrowDown className="w-3.5 h-3.5 text-slate-500" />
            </span>
          </a>
        </div>

      </div>
    </section>
  );
};