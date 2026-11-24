import React from 'react';
import { Eye, Flag, ShieldCheck, Sparkles } from 'lucide-react';
import { SITE_CONFIG } from '../config/siteConfig';

export const VisionMission: React.FC = () => {
  const { visionMission } = SITE_CONFIG;

  return (
    <section
      id="vision-mission"
      className="py-14 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 relative bg-[#06302B] text-white overflow-hidden"
    >
      {/* Floating Section Background Ambient Orbs */}
      <div className="absolute top-10 -left-20 w-80 h-80 rounded-full bg-[#B4F26B]/10 blur-[100px] pointer-events-none animate-float" />
      <div className="absolute -bottom-10 -right-20 w-96 h-96 rounded-full bg-[#0D4A41]/50 blur-[120px] pointer-events-none animate-float-reverse" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-10 sm:mb-16 reveal">
          <div className="biztop-eyebrow-dark">
            <Sparkles className="w-3.5 h-3.5 text-[#B4F26B] shrink-0 fill-[#B4F26B]" />
            <span>Strategic Direction & Institutional Mandate</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Vision & Mission
          </h2>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-normal">
            Guiding principles that define our institutional purpose, set our standards, and inspire our long-term societal contributions.
          </p>
        </div>

        {/* Vision & Mission Split Cards: 24px Radius */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          
          {/* Vision Card */}
          <div className="rounded-[24px] sm:rounded-[28px] p-6 sm:p-10 lg:p-12 bg-[#0A3D37] border border-white/10 flex flex-col justify-between relative group hover:border-[#B4F26B]/50 transition-all duration-300 shadow-xl reveal-scale reveal-delay-1 card-hover-lift glow-card">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-[#B4F26B] text-[#06302B] flex items-center justify-center font-bold">
                    <Eye className="w-5 h-5 stroke-[2.5]" />
                  </span>
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#B4F26B]">
                    {visionMission.vision.label}
                  </span>
                </div>
                <span className="text-xs text-white/40 font-mono">01 / Long-Term</span>
              </div>

              {/* Exact Vision Statement */}
              <blockquote className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug">
                “{visionMission.vision.statement}”
              </blockquote>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed pt-2 font-normal">
                {visionMission.vision.interpretation}
              </p>
            </div>

            <div className="pt-8 mt-8 border-t border-white/10 flex items-center justify-between text-xs font-medium text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B4F26B]" />
                <span>Forward-Looking Outlook</span>
              </div>
              <span className="text-[#B4F26B] font-mono font-semibold">NextGen 2030 Horizon</span>
            </div>
          </div>

          {/* Mission Card */}
          <div className="rounded-[24px] sm:rounded-[28px] p-6 sm:p-10 lg:p-12 bg-[#0A3D37] border border-white/10 flex flex-col justify-between relative group hover:border-[#B4F26B]/50 transition-all duration-300 shadow-xl reveal-scale reveal-delay-2 card-hover-lift glow-card">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-white text-[#06302B] flex items-center justify-center font-bold">
                    <Flag className="w-5 h-5 stroke-[2.5]" />
                  </span>
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-white">
                    {visionMission.mission.label}
                  </span>
                </div>
                <span className="text-xs text-white/40 font-mono">02 / Everyday Execution</span>
              </div>

              {/* Exact Mission Statement */}
              <blockquote className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug">
                “{visionMission.mission.statement}”
              </blockquote>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed pt-2 font-normal">
                {visionMission.mission.interpretation}
              </p>
            </div>

            <div className="pt-8 mt-8 border-t border-white/10 flex items-center justify-between text-xs font-medium text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white" />
                <span>Everyday Operational Mandate</span>
              </div>
              <span className="text-slate-200 font-mono font-semibold">Responsible Execution</span>
            </div>
          </div>

        </div>

        {/* 4 Organizational Core Commitments Row */}
        <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center gap-3 hover:border-white/20 transition-all">
            <span className="w-2 h-2 rounded-full bg-[#B4F26B]" />
            <span className="text-xs font-semibold text-slate-200">Institutional Integrity</span>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center gap-3 hover:border-white/20 transition-all">
            <span className="w-2 h-2 rounded-full bg-[#B4F26B]" />
            <span className="text-xs font-semibold text-slate-200">Ethical Digital Progress</span>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center gap-3 hover:border-white/20 transition-all">
            <span className="w-2 h-2 rounded-full bg-slate-300" />
            <span className="text-xs font-semibold text-slate-200">Public Social Support</span>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center gap-3 hover:border-white/20 transition-all">
            <span className="w-2 h-2 rounded-full bg-[#B4F26B]" />
            <span className="text-xs font-semibold text-slate-200">Grassroots Empowerment</span>
          </div>
        </div>

        {/* Official Tagline Banner */}
        <div className="mt-14 text-center">
          <p className="text-xs uppercase tracking-widest text-slate-400 font-mono">
            NextGen Official Corporate Mandate
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
            Leading Today, <span className="text-[#B4F26B]">Shaping Tomorrow.</span>
          </p>
        </div>

      </div>
    </section>
  );
};
