import React from 'react';
import { Target, Layers, ShieldCheck, CheckCircle2, Award, Sparkles } from 'lucide-react';
import { SITE_CONFIG } from '../config/siteConfig';
import { DirectorsShowcase } from './DirectorsShowcase';

export const AboutSection: React.FC = () => {
  const { about } = SITE_CONFIG;

  return (
    <section id="about" className="py-14 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 relative bg-[#F7F6EC] border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-3.5">
          <div className="biztop-eyebrow">
            <Sparkles className="w-3.5 h-3.5 text-[#06302B] shrink-0 fill-[#06302B]" />
            <span>{about.badge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#0B2B26] leading-tight">
            {about.heading}
          </h2>
          <p className="text-base sm:text-lg text-[#5B6B66] leading-relaxed font-normal pt-1">
            {about.overview}
          </p>
        </div>

        {/* Editorial Content Breakdown */}
        <div className="mt-14 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Purpose & Distinct Multidisciplinary Philosophy */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Purpose Panel: 24px Rounded White Card */}
            <div className="p-7 sm:p-8 rounded-[24px] biztop-card space-y-3.5">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-[#B4F26B] text-[#06302B] flex items-center justify-center font-bold shadow-xs">
                  <Target className="w-5 h-5 stroke-[2.5]" />
                </span>
                <h3 className="text-xl font-bold text-[#0B2B26]">{about.purposeHeading}</h3>
              </div>
              <p className="text-sm sm:text-base text-[#5B6B66] leading-relaxed font-normal">
                {about.purposeText}
              </p>
            </div>

            {/* Multidisciplinary Approach Panel: 24px Rounded White Card */}
            <div className="p-7 sm:p-8 rounded-[24px] biztop-card space-y-3.5">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-[#06302B] text-[#B4F26B] flex items-center justify-center font-bold shadow-xs">
                  <Layers className="w-5 h-5 stroke-[2.5]" />
                </span>
                <h3 className="text-xl font-bold text-[#0B2B26]">{about.approachHeading}</h3>
              </div>
              <p className="text-sm sm:text-base text-[#5B6B66] leading-relaxed font-normal">
                {about.approachText}
              </p>
            </div>

            {/* Verified Statement Callout */}
            <div className="p-6 rounded-[20px] bg-white border border-[#B4F26B]/50 border-l-4 border-l-[#06302B] text-xs sm:text-sm text-[#5B6B66] space-y-2 shadow-xs">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#06302B]">
                <Award className="w-4 h-4 text-[#06302B]" />
                <span>Institutional Governance Standards</span>
              </div>
              <p className="leading-relaxed font-normal">
                NextGen operates with an emphasis on institutional accountability, transparency, and measurable grassroots relevance across every public initiative.
              </p>
            </div>

          </div>

          {/* Right Column: 4 Foundation Pillars */}
          <div className="lg:col-span-6 space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#5B6B66] mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#06302B]" />
              <span>Core Strategic Foundations</span>
            </h3>

            {about.pillars.map((pillar, index) => (
              <div
                key={pillar.title}
                className="group p-6 rounded-[24px] biztop-card relative overflow-hidden"
              >
                {/* Thin vertical accent */}
                <div
                  className="absolute left-0 top-4 bottom-4 w-1.5 rounded-r-full"
                  style={{ backgroundColor: index % 2 === 0 ? '#B4F26B' : '#06302B' }}
                />

                <div className="pl-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base sm:text-lg font-bold text-[#0B2B26] group-hover:text-[#06302B] transition-colors">
                      {pillar.title}
                    </h4>
                    <span className="text-xs font-black text-[#06302B] bg-[#B4F26B]/40 px-2.5 py-0.5 rounded-full font-mono">
                      0{index + 1}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#5B6B66] leading-relaxed font-normal">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            ))}

            {/* Organizational Transparency Notice */}
            <div className="pt-3 text-xs text-[#5B6B66] leading-relaxed italic">
              * Official organizational charters, executive appointments, and statutory governance filings are upheld in strict compliance with NextGen governance.
            </div>

          </div>

        </div>

        {/* Executive Board of Directors Rotating Showcase */}
        <DirectorsShowcase />

      </div>
    </section>
  );
};
