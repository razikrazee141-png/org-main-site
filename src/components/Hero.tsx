import React, { useState } from 'react';
import { ArrowDown, ArrowRight, Sparkles, ShieldCheck, Mail, Building2, ExternalLink } from 'lucide-react';
import { BrandLogo } from '../brand/BrandLogo';
import { SITE_CONFIG } from '../config/siteConfig';

export const Hero: React.FC = () => {
  const [cardRotate, setCardRotate] = useState({ x: 0, y: 0 });

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setCardRotate({
      x: -(y / rect.height) * 6,
      y: (x / rect.width) * 6,
    });
  };

  const handleCardMouseLeave = () => {
    setCardRotate({ x: 0, y: 0 });
  };

  const handleSelectQuadrant = (subject: string) => {
    window.dispatchEvent(new CustomEvent('nextgen_select_subject', { detail: subject }));
  };

  return (
    <section
      id="home"
      className="relative min-h-[760px] lg:min-h-[820px] flex items-center justify-center pt-20 sm:pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden w-full bg-[#06302B] text-white"
    >
      {/* Soft Vignette / Gradient Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(180,242,107,0.08),transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(10,61,55,0.6),transparent_60%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center w-full">
          
          {/* Left Column: Bold Headline & Mission */}
          <div className="lg:col-span-7 min-w-0 text-left space-y-6 sm:space-y-7 animate-fadeRise">
            
            {/* Small Eyebrow Label with Star */}
            <div className="biztop-eyebrow-dark">
              <Sparkles className="w-3.5 h-3.5 text-[#B4F26B] shrink-0 fill-[#B4F26B]" />
              <span>Official Institutional Portal &bull; Verified Entity</span>
            </div>

            {/* Bold Headline with ONE Key Word in Lime */}
            <div className="space-y-1">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold uppercase tracking-tight text-white leading-[1.08] break-words">
                <span className="block">Leading Today,</span>
                <span className="block text-[#B4F26B]">
                  Shaping Tomorrow.
                </span>
              </h1>
            </div>

            {/* Concise Mission Introduction */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed font-normal">
              {SITE_CONFIG.hero.subtext}
            </p>

            {/* Pill Action Buttons with Circular Arrow Chip */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3.5 sm:gap-4 pt-2">
              <a
                href="#focus-areas"
                className="btn-biztop-pill text-sm sm:text-base font-bold shadow-lg group"
              >
                <span>Explore Disciplinary Scope</span>
                <span className="arrow-chip">
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </span>
              </a>

              <a
                href="#contact"
                className="btn-biztop-secondary text-sm sm:text-base"
              >
                <Mail className="w-4 h-4 text-[#B4F26B]" />
                <span>Contact Secretariat</span>
              </a>
            </div>

            {/* Official Key Institutional Indicators Strip */}
            <div className="pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <a
                href="#focus-areas"
                className="group p-4 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 hover:border-[#B4F26B]/50 transition-all duration-200 block text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#B4F26B]" />
                    <div className="text-xl font-black text-[#B4F26B] font-mono leading-none">05</div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#B4F26B] transition-colors" />
                </div>
                <div className="text-xs font-bold text-white mt-2 group-hover:text-[#B4F26B] transition-colors">
                  Focus Disciplines
                </div>
                <div className="text-[11px] text-slate-300 truncate mt-0.5">Software, Edu & Civic</div>
              </a>

              <a
                href="#about"
                className="group p-4 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 hover:border-[#B4F26B]/50 transition-all duration-200 block text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#B4F26B]" />
                    <div className="text-xl font-black text-[#B4F26B] font-mono leading-none">05</div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#B4F26B] transition-colors" />
                </div>
                <div className="text-xs font-bold text-white mt-2 group-hover:text-[#B4F26B] transition-colors">
                  Board Directors
                </div>
                <div className="text-[11px] text-slate-300 truncate mt-0.5">Executive Governance</div>
              </a>

              <a
                href="#vision-mission"
                className="group p-4 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 hover:border-[#B4F26B]/50 transition-all duration-200 block text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#B4F26B]" />
                    <div className="text-xl font-black text-white font-mono leading-none">100%</div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#B4F26B] transition-colors" />
                </div>
                <div className="text-xs font-bold text-white mt-2 group-hover:text-[#B4F26B] transition-colors">
                  Grassroots Impact
                </div>
                <div className="text-[11px] text-slate-300 truncate mt-0.5">Community Centered</div>
              </a>
            </div>

          </div>

          {/* Right Column: Hero Visual Showcase with Rounded 24px Card */}
          <div className="lg:col-span-5 min-w-0 flex justify-center lg:justify-end w-full">
            <div
              className="relative w-full max-w-sm sm:max-w-md lg:max-w-none transition-transform duration-200 ease-out cursor-default select-none"
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
              style={{
                transform: `perspective(1000px) rotateX(${cardRotate.x}deg) rotateY(${cardRotate.y}deg)`,
              }}
            >
              
              {/* Outer decorative ambient lime glow */}
              <div className="absolute -inset-4 rounded-3xl bg-[#B4F26B]/15 blur-2xl opacity-75 -z-10" />

              {/* Floating Pill Top Badge */}
              <div className="absolute -top-3.5 left-6 z-20 hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white text-[#06302B] shadow-md text-[11px] font-bold">
                <Building2 className="w-3.5 h-3.5 text-[#06302B]" />
                <span>NextGen Institutional Charter</span>
              </div>

              {/* Main Visual Showcase Card: White 24px Rounded Card */}
              <div className="bg-white text-[#0B2B26] rounded-[24px] p-6 sm:p-8 shadow-2xl border border-white/20 relative overflow-hidden">
                
                {/* Center Brand Identity Composition */}
                <div className="flex flex-col items-center justify-center text-center space-y-4 relative z-10 pt-2">
                  
                  {/* Official Emblem */}
                  <div className="relative p-4 rounded-2xl bg-[#F7F6EC] border border-[#06302B]/10 mx-auto transition-transform duration-300 hover:scale-105">
                    <BrandLogo variant="mark" size="lg" />
                  </div>

                  {/* Official Wordmark Lockup */}
                  <div className="flex items-center justify-center w-full max-w-xs mx-auto py-1">
                    <img
                      src="/brand/logo-wordmark.png"
                      alt="NextGen — Leading Today, Shaping Tomorrow"
                      className="h-7 sm:h-8 w-auto object-contain mx-auto block"
                    />
                  </div>

                  <p className="text-xs text-[#5B6B66] max-w-xs leading-relaxed font-normal mx-auto">
                    A registered multidisciplinary organisation uniting software services, practical education, and civic welfare.
                  </p>

                  {/* 4 Quadrants Matrix with rounded pills & lime hover states */}
                  <div className="w-full grid grid-cols-2 gap-2 pt-4 border-t border-slate-100 text-left">
                    <a
                      href="#focus-areas"
                      onClick={() => handleSelectQuadrant('Software Services')}
                      className="p-3 rounded-2xl bg-[#F7F6EC] hover:bg-[#B4F26B]/20 border border-slate-200/80 hover:border-[#B4F26B] transition-all group block cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#06302B] shrink-0" />
                        <span className="text-xs font-bold text-[#06302B]">
                          Software Services
                        </span>
                      </div>
                      <p className="text-[10px] text-[#5B6B66] mt-0.5 truncate">Digital support & tools</p>
                    </a>

                    <a
                      href="#focus-areas"
                      onClick={() => handleSelectQuadrant('Education & Digital Skills')}
                      className="p-3 rounded-2xl bg-[#F7F6EC] hover:bg-[#B4F26B]/20 border border-slate-200/80 hover:border-[#B4F26B] transition-all group block cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#06302B] shrink-0" />
                        <span className="text-xs font-bold text-[#06302B]">
                          Knowledge
                        </span>
                      </div>
                      <p className="text-[10px] text-[#5B6B66] mt-0.5 truncate">Practical learning</p>
                    </a>

                    <a
                      href="#focus-areas"
                      onClick={() => handleSelectQuadrant('Social Services & Public Assistance')}
                      className="p-3 rounded-2xl bg-[#F7F6EC] hover:bg-[#B4F26B]/20 border border-slate-200/80 hover:border-[#B4F26B] transition-all group block cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#06302B] shrink-0" />
                        <span className="text-xs font-bold text-[#06302B]">
                          Compassion
                        </span>
                      </div>
                      <p className="text-[10px] text-[#5B6B66] mt-0.5 truncate">Public welfare</p>
                    </a>

                    <a
                      href="#focus-areas"
                      onClick={() => handleSelectQuadrant('Community Development Collaboration')}
                      className="p-3 rounded-2xl bg-[#F7F6EC] hover:bg-[#B4F26B]/20 border border-slate-200/80 hover:border-[#B4F26B] transition-all group block cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#06302B] shrink-0" />
                        <span className="text-xs font-bold text-[#06302B]">
                          Community
                        </span>
                      </div>
                      <p className="text-[10px] text-[#5B6B66] mt-0.5 truncate">Citizen engagement</p>
                    </a>
                  </div>

                </div>
              </div>

              {/* Floating Bottom Badge */}
              <div className="absolute -bottom-3 right-6 z-20 hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#B4F26B] text-[#06302B] shadow-md text-[11px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-[#06302B]" />
                <span>Verified Institutional Entity</span>
              </div>

            </div>
          </div>

        </div>

        {/* Subtle Scroll Indicator */}
        <div className="mt-14 flex justify-center">
          <a
            href="#about"
            className="group flex flex-col items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-[#B4F26B] transition-colors"
            aria-label="Scroll to About section"
          >
            <span>Explore NextGen</span>
            <span className="p-1.5 rounded-full border border-white/20 group-hover:border-[#B4F26B] group-hover:bg-[#B4F26B] group-hover:text-[#06302B] shadow-xs transition-all">
              <ArrowDown className="w-3.5 h-3.5" />
            </span>
          </a>
        </div>

      </div>
    </section>
  );
};
