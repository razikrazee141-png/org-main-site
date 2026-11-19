import React from 'react';
import { ArrowUp } from 'lucide-react';
import { BrandLogo } from '../brand/BrandLogo';
import { SITE_CONFIG } from '../config/siteConfig';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#06302B] text-slate-200 pt-14 pb-12 sm:pt-16 sm:pb-14 border-t border-white/[0.08] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10 pb-12 border-b border-white/[0.08] items-start">
          
          {/* Brand Column */}
          <div className="md:col-span-6 space-y-4">
            <div className="bg-white rounded-2xl p-3 inline-block shadow-md border border-white/20">
              <BrandLogo variant="lockup" size="md" />
            </div>

            <p className="text-sm font-semibold tracking-wide text-white">
              {SITE_CONFIG.brand.tagline}
            </p>

            <p className="text-xs text-slate-300 max-w-md leading-relaxed font-normal">
              {SITE_CONFIG.brand.shortBio}
            </p>
          </div>

          {/* Navigation Links Column */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#B4F26B] font-mono">
              Corporate Navigation
            </h4>
            <ul className="space-y-1 text-sm">
              {SITE_CONFIG.navigation.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.href}
                    className="block py-1.5 text-slate-300 hover:text-[#B4F26B] transition-colors text-sm touch-manipulation"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Verified Contact & Back to Top */}
          <div className="md:col-span-3 space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#B4F26B] font-mono">
              Inquiries
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              For governance correspondence or collaborative inquiries:
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B4F26B] hover:text-white transition-colors py-1"
            >
              <span>Access Official Contact Form</span>
              <span>&rarr;</span>
            </a>

            <div className="pt-2">
              <button
                type="button"
                onClick={scrollToTop}
                className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-full bg-white/[0.08] hover:bg-[#B4F26B] hover:text-[#06302B] border border-white/10 text-xs font-semibold text-slate-200 transition-all duration-200 cursor-pointer shadow-sm group touch-manipulation active:scale-95"
                aria-label="Back to top"
              >
                <ArrowUp className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-y-0.5" />
                <span>Return to Top</span>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Legal & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-300/80">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <span>{SITE_CONFIG.footer.copyright}</span>
          </div>

          <div className="text-center sm:text-right text-[11px] text-slate-400">
            {SITE_CONFIG.footer.legalNote}
          </div>
        </div>

      </div>
    </footer>
  );
};
