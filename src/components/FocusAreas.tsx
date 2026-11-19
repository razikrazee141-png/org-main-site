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
    if (title.includes('Software') || title.includes('Technology')) mapped = 'Software Services';
    else if (title.includes('Education')) mapped = 'Education & Digital Skills';
    else if (title.includes('Social Services')) mapped = 'Social Services & Public Assistance';
    else if (title.includes('Digital Skills')) mapped = 'Education & Digital Skills';
    else if (title.includes('Community')) mapped = 'Community Development Collaboration';

    window.dispatchEvent(new CustomEvent('nextgen_select_subject', { detail: mapped }));
  };

  return (
    <section id="focus-areas" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 relative bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl space-y-3">
            <div className="biztop-eyebrow">
              <Sparkles className="w-3.5 h-3.5 text-[#06302B] shrink-0 fill-[#06302B]" />
              <span>Organisational Scope & Engagement</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#0B2B26]">
              Areas of Focus & Engagement
            </h2>
            <p className="text-base sm:text-lg text-[#5B6B66] font-normal leading-relaxed">
              NextGen operates across five interconnected disciplines to deliver balanced, meaningful, and long-term societal progress.
            </p>
          </div>

          <div className="text-xs font-bold text-[#06302B] font-mono hidden md:flex items-center gap-2 bg-[#F7F6EC] px-4 py-2 rounded-full border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-[#B4F26B]" />
            <span>05 Active Disciplinary Domains</span>
          </div>
        </div>

        {/* Desktop & Tablet: Interactive Split Layout with Rounded Biztop Cards */}
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
                  className={`w-full text-left p-4 sm:p-5 rounded-[20px] transition-all duration-200 relative flex items-center justify-between gap-3 border min-w-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#06302B] text-white shadow-lg border-[#06302B] scale-[1.01]'
                      : 'bg-[#F7F6EC] hover:bg-slate-100 hover:border-slate-300 border-transparent text-[#0B2B26]'
                  }`}
                  aria-pressed={isActive}
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1 pl-1">
                    <span
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 font-mono transition-colors ${
                        isActive
                          ? 'bg-[#B4F26B] text-[#06302B]'
                          : 'bg-white text-[#5B6B66]'
                      }`}
                    >
                      {area.number}
                    </span>

                    <div className="min-w-0 flex-1">
                      <h3 className={`text-sm sm:text-base font-bold transition-colors truncate ${isActive ? 'text-white' : 'text-[#0B2B26]'}`}>
                        {area.title}
                      </h3>
                      <p className={`text-xs mt-0.5 truncate ${isActive ? 'text-slate-300' : 'text-[#5B6B66]'}`}>
                        {area.deliverablesSummary}
                      </p>
                    </div>
                  </div>

                  <ChevronRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isActive ? 'text-[#B4F26B] translate-x-1' : 'text-slate-400'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Right Column: Active Focus Area Detailed Stage */}
          <div className="lg:col-span-7" id="focus-area-detail">
            <div
              key={activeArea.id}
              className="rounded-[28px] bg-[#F7F6EC] p-8 sm:p-12 shadow-sm border border-slate-200/90 relative overflow-hidden transition-all duration-200 min-h-[480px] flex flex-col justify-between animate-fadeIn"
            >
              {/* Top Accent Line */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5 bg-[#B4F26B]"
              />

              <div className="space-y-6">
                
                {/* Meta details */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-12 h-12 rounded-full bg-[#06302B] text-[#B4F26B] flex items-center justify-center shadow-xs"
                    >
                      <IconComponent className="w-6 h-6 stroke-[2.5]" />
                    </span>
                    <div>
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#06302B]">
                        Focus Domain {activeArea.number}
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0B2B26]">
                        {activeArea.title}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Summary narrative */}
                <p className="text-base sm:text-lg text-[#5B6B66] leading-relaxed font-normal">
                  {activeArea.summary}
                </p>

                {/* Core Key Scope Bullets */}
                <div className="space-y-3.5 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#06302B] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#06302B]" />
                    <span>Key Dimensions & Initiatives</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeArea.scope.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3.5 rounded-[16px] bg-white border border-slate-200/70 text-sm text-[#0B2B26] shadow-2xs"
                      >
                        <span className="mt-0.5 p-1 rounded-full bg-[#B4F26B] text-[#06302B] shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                        <span className="leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Bottom footer bar */}
              <div className="pt-8 mt-8 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
                <div className="text-xs text-[#5B6B66] italic">
                  Institutional focus area strictly following NextGen governance standards.
                </div>
                <a
                  href="#contact"
                  onClick={() => handleInquireDiscipline(activeArea.title)}
                  className="btn-biztop-pill text-xs sm:text-sm font-bold shadow-md"
                >
                  <span>Inquire about this discipline</span>
                  <span className="arrow-chip">
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </span>
                </a>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
