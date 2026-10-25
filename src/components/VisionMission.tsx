import React from 'react';
import { Eye, Flag, Sparkles } from 'lucide-react';
import { SITE_CONFIG } from '../config/siteConfig';

export const VisionMission: React.FC = () => {
  const { visionMission } = SITE_CONFIG;

  return (
    <section
      id="vision-mission"
      className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 relative dark-surface text-white overflow-hidden"
    >
      {/* Subtle background ambient gradients */}
      <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-[#125EA2]/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-[#388E3C]/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase text-sky-400 bg-sky-950/60 border border-sky-800/50">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Strategic Direction</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Vision & Mission
          </h2>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
            Guiding principles that define our purpose, set our standards, and inspire our long-term contributions.
          </p>
        </div>

        {/* Vision & Mission Split Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Vision Card */}
          <div className="rounded-3xl p-8 sm:p-12 bg-white/[0.04] border border-white/10 backdrop-blur-md flex flex-col justify-between relative group hover:border-[#125EA2]/50 transition-all duration-300">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="p-3 rounded-2xl bg-[#125EA2] text-white shadow-md">
                    <Eye className="w-6 h-6" />
                  </span>
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-sky-400">
                    {visionMission.vision.label}
                  </span>
                </div>
              </div>

              {/* Exact Vision Statement */}
              <blockquote className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug">
                “{visionMission.vision.statement}”
              </blockquote>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed pt-2">
                {visionMission.vision.interpretation}
              </p>
            </div>

            <div className="pt-8 mt-8 border-t border-white/10 flex items-center gap-2 text-xs font-medium text-slate-400">
              <span className="w-2 h-2 rounded-full bg-[#125EA2]" />
              <span>Forward-Looking Outlook</span>
            </div>
          </div>

          {/* Mission Card */}
          <div className="rounded-3xl p-8 sm:p-12 bg-white/[0.04] border border-white/10 backdrop-blur-md flex flex-col justify-between relative group hover:border-[#388E3C]/50 transition-all duration-300">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="p-3 rounded-2xl bg-[#388E3C] text-white shadow-md">
                    <Flag className="w-6 h-6" />
                  </span>
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">
                    {visionMission.mission.label}
                  </span>
                </div>
              </div>

              {/* Exact Mission Statement */}
              <blockquote className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug">
                “{visionMission.mission.statement}”
              </blockquote>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed pt-2">
                {visionMission.mission.interpretation}
              </p>
            </div>

            <div className="pt-8 mt-8 border-t border-white/10 flex items-center gap-2 text-xs font-medium text-slate-400">
              <span className="w-2 h-2 rounded-full bg-[#388E3C]" />
              <span>Everyday Operational Mandate</span>
            </div>
          </div>

        </div>

        {/* Official Tagline Banner */}
        <div className="mt-16 text-center">
          <p className="text-xs sm:text-sm uppercase tracking-widest text-slate-400">
            NextGen Official Corporate Mandate
          </p>
          <p className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
            Leading Today, Shaping Tomorrow.
          </p>
        </div>

      </div>
    </section>
  );
};
