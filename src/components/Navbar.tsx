import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { BrandLogo } from '../brand/BrandLogo';
import { SITE_CONFIG } from '../config/siteConfig';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);

      // Detect active section
      const sections = ['home', 'about', 'focus-areas', 'vision-mission', 'contact'];
      const scrollPosition = window.scrollY + 160;

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
          ? 'glass-nav shadow-[0_4px_24px_rgba(0,0,0,0.04)] py-3.5'
          : 'bg-transparent py-5 sm:py-6'
      }`}
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Brand Logo Lockup */}
          <a
            href="#home"
            className="flex items-center group focus-visible:ring-2 focus-visible:ring-[#125EA2] rounded-lg transition-transform shrink-0"
            aria-label="NextGen Homepage"
            onClick={() => setMobileMenuOpen(false)}
          >
            <BrandLogo variant="lockup" size="md" className="group-hover:opacity-95" />
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2" aria-label="Main Navigation">
            {SITE_CONFIG.navigation.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  className={`px-3.5 py-2 rounded-full text-sm font-medium transition-colors relative ${
                    isActive
                      ? 'text-[#125EA2] font-semibold bg-[#125EA2]/5'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#125EA2]" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Contact CTA Button */}
          <div className="hidden md:flex items-center space-x-3">
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-[#125EA2] hover:bg-[#0E4F8B] shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98]"
            >
              <span>Connect With Us</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#125EA2]"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation"
          className="md:hidden glass-nav border-b border-slate-200/90 shadow-xl px-5 pt-4 pb-6 transition-all duration-200"
        >
          <div className="space-y-1.5 pt-2">
            {SITE_CONFIG.navigation.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
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
            <div className="pt-3">
              <a
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-base font-semibold text-white bg-[#125EA2] hover:bg-[#0E4F8B] shadow-sm"
              >
                <span>Connect With Us</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
