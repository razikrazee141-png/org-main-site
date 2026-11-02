import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight, ShieldCheck, Sparkles } from 'lucide-react';
import { BrandLogo } from '../brand/BrandLogo';
import { SITE_CONFIG } from '../config/siteConfig';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);

      // Detect active section
      const sections = ['home', 'about', 'focus-areas', 'vision-mission', 'contact'];
      const scrollPosition = window.scrollY + 180;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'pt-3 sm:pt-4 pb-2'
          : 'pt-5 sm:pt-6 pb-2'
      }`}
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`flex items-center justify-between gap-3 px-4 sm:px-6 py-2.5 rounded-full transition-all duration-300 ${
            isScrolled
              ? 'bg-white/85 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-200/80 backdrop-blur-xl'
              : 'bg-white/60 sm:bg-white/40 border border-slate-200/50 backdrop-blur-md'
          }`}
        >
          {/* Brand Logo Lockup */}
          <a
            href="#home"
            className="flex items-center group focus-visible:ring-2 focus-visible:ring-[#125EA2] rounded-full transition-transform shrink-0"
            aria-label="NextGen Homepage"
            onClick={() => setMobileMenuOpen(false)}
          >
            <BrandLogo variant="lockup" size="md" className="group-hover:opacity-95 transition-opacity" />
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5 p-1 bg-slate-100/60 rounded-full border border-slate-200/50" aria-label="Main Navigation">
            {SITE_CONFIG.navigation.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  className={`px-4 py-1.5 rounded-full text-xs lg:text-sm font-medium transition-all duration-200 relative ${
                    isActive
                      ? 'text-slate-900 font-semibold bg-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Right Action Icons & Primary CTA */}
          <div className="hidden md:flex items-center space-x-2.5">
            {/* Quick Admin Portal shortcut */}
            <a
              href="/admin"
              title="Admin Inquiries Gateway"
              className="p-2 rounded-full text-slate-500 hover:text-[#125EA2] hover:bg-slate-100 transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
            </a>

            <a
              href="#contact"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#125EA2] to-[#0E4F8B] hover:shadow-md hover:shadow-[#125EA2]/20 transition-all duration-200 active:scale-[0.98]"
            >
              <span>Connect</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-1 shrink-0">
            <a
              href="/admin"
              title="Admin Portal"
              className="p-2 text-slate-500 hover:text-[#125EA2]"
            >
              <ShieldCheck className="w-5 h-5" />
            </a>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-colors focus:outline-none"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="max-w-7xl mx-auto px-4 mt-2">
          <div
            id="mobile-navigation"
            className="md:hidden bg-white/95 backdrop-blur-2xl rounded-3xl border border-slate-200 shadow-2xl p-5 transition-all duration-200 animate-fadeIn"
          >
            <div className="space-y-1.5">
              {SITE_CONFIG.navigation.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-2.5 rounded-2xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-[#125EA2] bg-[#125EA2]/10 font-semibold'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {item.label}
                  </a>
                );
              })}
              
              <div className="pt-3 border-t border-slate-100 flex gap-2">
                <a
                  href="#contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold text-white bg-[#125EA2]"
                >
                  <span>Connect With Us</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>

                <a
                  href="/admin"
                  className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-600 bg-slate-100 flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
