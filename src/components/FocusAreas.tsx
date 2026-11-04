import React, { useState } from 'react';
import { 
  CodeXml, 
  GraduationCap, 
  HeartHandshake, 
  Sparkles, 
  UsersRound, 
  ArrowRight, 
  Check, 
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { SITE_CONFIG } from '../config/siteConfig';

const iconMap = {
  CodeXml,
  GraduationCap,
  HeartHandshake,
  Sparkles,
  UsersRound,
};

export const FocusAreas: React.FC = () => {
  const { focusAreas } = SITE_CONFIG;
  const [activeAreaId, setActiveAreaId] = useState<string>(focusAreas[0].id);

  const activeArea = focusAreas.find((item) => item.id === activeAreaId) || focusAreas[0];
  const IconComponent = iconMap[activeArea.iconName as keyof typeof iconMap] || CodeXml;

  const handleSelectArea = (id: string) => {
    setActiveAreaId(id);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      const detailEl = document.getElementById('focus-area-detail');
      if (detailEl) {
        detailEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  };

  const handleInquireDiscipline = (title: string) => {
    let mapped = 'General Corporate Inquiry';
    if (title.includes('Technology')) mapped = 'Technology & Software Solutions';
    else if (title.includes('Education')) mapped = 'Education & Digital Skills';
    else if (title.includes('Social Services')) mapped = 'Social Services & Public Assistance';
    else if (title.includes('Digital Skills')) mapped = 'Education & Digital Skills';
    else if (title.includes('Community')) mapped = 'Community Development Collaboration';

    window.dispatchEvent(new CustomEvent('nextgen_select_subject', { detail: mapped }));
  };

  return (
    <section id="focus-areas" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 relative bg-[#FAF9F6] border-b border-slate-200/70">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-[#125EA2] bg-[#125EA2]/10 border border-[#125EA2]/20">
              <ShieldCheck className="w-3.5 h-3.5 text-[#125EA2]" />
              <span>Organisational Scope & Engagement</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
              Areas of Focus & Engagement
            </h2>
            <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
              NextGen operates across five interconnected disciplines to deliver balanced, meaningful, and long-term societal progress.
            </p>
          </div>

          <div className="text-xs text-slate-500 font-mono hidden md:flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>05 Active Disciplinary Domains</span>
          </div>
        </div>

        {/* Desktop & Tablet: Interactive Split Editorial Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: List of 5 Areas */}
          <div className="lg:col-span-5 space-y-3">
            {focusAreas.map((area) => {
              const isActive = area.id === activeAreaId;

              return (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => handleSelectArea(area.id)}
                  className={`w-full text-left p-4 sm:p-5 rounded-2xl transition-all duration-300 relative flex items-center justify-between gap-3 border min-w-0 cursor-pointer ${
                    isActive
                      ? 'bg-white shadow-lg border-slate-200/90 scale-[1.01]'
                      : 'bg-white/60 hover:bg-white hover:border-slate-200/80 border-transparent text-slate-700'
                  }`}
                  aria-pressed={isActive}
                >
                  {/* Left accent strip when active */}
                  {isActive && (
                    <div
                      className="absolute left-0 top-3 bottom-3 w-1.5 rounded-r-full"
                      style={{ backgroundColor: area.accentHex }}
                    />
                  )}

                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1 pl-1">
                    <span
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${
                        isActive
                          ? 'text-white shadow-xs'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                      style={{
                        backgroundColor: isActive ? area.accentHex : undefined,
                      }}
                    >
                      {area.number}
                    </span>

                    <div className="min-w-0 flex-1">
                      <h3 className={`text-sm sm:text-base font-bold transition-colors truncate ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>
                        {area.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">
                        {area.deliverablesSummary}
                      </p>
                    </div>
                  </div>

                  <ChevronRight
                    className={`w-5 h-5 shrink-0 transition-transform ${
                      isActive ? 'text-slate-800 translate-x-1' : 'text-slate-300'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Right Column: Active Focus Area Detailed Stage */}
          <div className="lg:col-span-7" id="focus-area-detail">
            <div className="rounded-3xl bg-white border border-slate-200/90 p-8 sm:p-12 shadow-xl relative overflow-hidden transition-all duration-500 min-h-[500px] flex flex-col justify-between">
              
              {/* Top Accent Gradient Line */}
              <div
                className="absolute top-0 left-0 right-0 h-2 transition-all duration-500"
                style={{ backgroundColor: activeArea.accentHex }}
              />

              <div className="space-y-8">
                
                {/* Meta details */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className="p-3 rounded-2xl text-white shadow-sm"
                      style={{ backgroundColor: activeArea.accentHex }}
                    >
                      <IconComponent className="w-6 h-6" />
                    </span>
                    <div>
                      <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">
                        Focus Domain {activeArea.number}
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                        {activeArea.title}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Summary narrative */}
                <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
                  {activeArea.summary}
                </p>

                {/* Core Key Scope Bullets */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#125EA2]" />
                    <span>Key Dimensions & Initiatives</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {activeArea.scope.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-100 text-sm text-slate-700 transition-colors"
                      >
                        <span
                          className="mt-0.5 p-1 rounded-full text-white shrink-0 shadow-2xs"
                          style={{ backgroundColor: activeArea.accentHex }}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                        <span className="leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Bottom footer bar */}
              <div className="pt-8 mt-8 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <div className="text-xs text-slate-500 italic">
                  Institutional focus area strictly following NextGen governance standards.
                </div>
                <a
                  href="#contact"
                  onClick={() => handleInquireDiscipline(activeArea.title)}
                  className="inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:underline group cursor-pointer"
                  style={{ color: activeArea.accentHex }}
                >
                  <span>Inquire about this discipline</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};