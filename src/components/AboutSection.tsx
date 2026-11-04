import React from 'react';
import { Target, Layers, ShieldCheck, CheckCircle2, Award } from 'lucide-react';
import { SITE_CONFIG } from '../config/siteConfig';
import { DirectorsShowcase } from './DirectorsShowcase';

export const AboutSection: React.FC = () => {
  const { about } = SITE_CONFIG;

  return (
    <section id="about" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 relative bg-white border-y border-slate-200/70">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-[#125EA2] bg-[#125EA2]/10 border border-[#125EA2]/20">
            <ShieldCheck className="w-3.5 h-3.5 text-[#125EA2]" />
            <span>{about.badge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
            {about.heading}
          </h2>
          <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-normal pt-2">
            {about.overview}
          </p>
        </div>

        {/* Editorial Content Breakdown */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Purpose & Distinct Multidisciplinary Philosophy */}
          <div className="lg:col-span-6 space-y-8">
            
            {/* Purpose Panel */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#FAF9F6] to-white border border-slate-200/90 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 space-y-4">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-xl bg-[#125EA2] text-white shadow-xs">
                  <Target className="w-5 h-5" />
                </span>
                <h3 className="text-xl font-bold text-slate-900">{about.purposeHeading}</h3>
              </div>
              <p className="text-base text-slate-600 leading-relaxed">
                {about.purposeText}
              </p>
            </div>

            {/* Multidisciplinary Approach Panel */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#FAF9F6] to-white border border-slate-200/90 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 space-y-4">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-xl bg-[#388E3C] text-white shadow-xs">
                  <Layers className="w-5 h-5" />
                </span>
                <h3 className="text-xl font-bold text-slate-900">{about.approachHeading}</h3>
              </div>
              <p className="text-base text-slate-600 leading-relaxed">
                {about.approachText}
              </p>
            </div>

            {/* Verified Statement Callout */}
            <div className="p-6 rounded-2xl border-l-4 border-[#125EA2] bg-slate-50/90 text-sm text-slate-600 space-y-2 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <Award className="w-4 h-4 text-[#125EA2]" />
                <span>Institutional Governance Standards</span>
              </div>
              <p className="leading-relaxed">
                NextGen operates with an emphasis on institutional accountability, transparency, and measurable grassroots relevance across every public initiative.
              </p>
            </div>

          </div>

          {/* Right Column: 4 Foundation Pillars */}
          <div className="lg:col-span-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#125EA2]" />
              <span>Core Strategic Foundations</span>
            </h3>

            {about.pillars.map((pillar, index) => (
              <div
                key={pillar.title}
                className="group p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden"
              >
                {/* Brand colored vertical accent indicator */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-300 group-hover:w-2"
                  style={{ backgroundColor: pillar.color }}
                />

                <div className="pl-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold text-slate-900 group-hover:text-[#125EA2] transition-colors">
                      {pillar.title}
                    </h4>
                    <span className="text-xs font-bold text-slate-400 font-mono">0{index + 1}</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            ))}

            {/* Organizational Transparency Notice */}
            <div className="pt-4 text-xs text-slate-400 leading-relaxed italic">
              * Official organizational charters, executive appointments, and statutory registration filings are verified by NextGen governance.
            </div>

          </div>

        </div>

        {/* Executive Board of Directors Rotating Showcase */}
        <DirectorsShowcase />

      </div>
    </section>
  );
};