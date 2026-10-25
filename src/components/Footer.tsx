import React from 'react';
import { ArrowUp } from 'lucide-react';
import { BrandLogo } from '../brand/BrandLogo';
import { SITE_CONFIG } from '../config/siteConfig';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-800 items-start">
          
          {/* Brand Column */}
          <div className="md:col-span-6 space-y-4">
            <div className="bg-white/95 rounded-xl p-3 inline-block shadow-sm">
              <BrandLogo variant="lockup" size="md" />
            </div>

            <p className="text-sm font-semibold tracking-wide text-white">
              {SITE_CONFIG.brand.tagline}
            </p>

            <p className="text-xs text-slate-400 max-w-md leading-relaxed font-normal">
              {SITE_CONFIG.brand.shortBio}
            </p>
          </div>

          {/* Navigation Links Column */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Corporate Navigation
            </h4>
            <ul className="space-y-2 text-sm">
              {SITE_CONFIG.navigation.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.href}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Verified Contact & Back to Top */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Inquiries
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              For governance correspondence or collaborative inquiries:
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors"
            >
              <span>Access Official Contact Form</span>
              <span>&rarr;</span>
            </a>

            <div className="pt-2">
              <button
                type="button"
                onClick={scrollToTop}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 hover:text-white transition-colors"
                aria-label="Back to top"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                <span>Return to Top</span>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Legal & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span>{SITE_CONFIG.footer.copyright}</span>
            <span className="text-slate-700">|</span>
            <a
              href="?view=admin"
              className="text-slate-500 hover:text-slate-300 transition-colors text-[11px]"
              title="Official Staff Portal to review incoming inquiries"
            >
              Inquiries Portal
            </a>
          </div>

          <div className="text-center sm:text-right text-[11px] text-slate-400">
            {SITE_CONFIG.footer.legalNote}
          </div>
        </div>

      </div>
    </footer>
  );
};
