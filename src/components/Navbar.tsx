import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight, Sparkles } from 'lucide-react';
import { BrandLogo } from '../brand/BrandLogo';
import { SITE_CONFIG } from '../config/siteConfig';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

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

  // Close mobile menu on ESC key or window resize
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-[#06302B]/60 backdrop-blur-xs z-40 md:hidden animate-fadeIn"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Slim Top Bar in Lime with Small Dark Text */}
      <div className="bg-[#B4F26B] text-[#06302B] py-1.5 px-4 text-center text-xs font-bold tracking-wide relative z-50 flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 shrink-0" />
        <span>Official Multidisciplinary Organization &bull; Software Services &bull; Education &bull; Social Welfare</span>
      </div>

      {/* Sticky Dark-Green Navbar Below */}
      <header
        className={`sticky top-0 left-0 right-0 z-50 transition-all duration-200 bg-[#06302B] border-b border-[#0A3D37] ${
          isScrolled
            ? 'shadow-[0_4px_24px_rgba(6,48,43,0.35)] py-3 backdrop-blur-md bg-[#06302B]/95'
            : 'py-4'
        }`}
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-6">
            
            {/* Brand Logo Lockup */}
            <a
              href="#home"
              className="flex items-center py-1 group focus-visible:outline-2 focus-visible:outline-[#B4F26B] rounded-full shrink-0 transition-transform duration-200 hover:scale-[1.02]"
              aria-label="NextGen Homepage"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="bg-white rounded-full px-3.5 py-1.5 shadow-xs">
                <BrandLogo variant="lockup" size="md" />
              </div>
            </a>

            {/* Desktop Clean White Nav Links with Active Lime Highlight */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2" aria-label="Main Navigation">
              {SITE_CONFIG.navigation.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    className={`px-4 py-2 text-sm font-semibold tracking-tight transition-colors duration-150 relative ${
                      isActive
                        ? 'text-[#B4F26B]'
                        : 'text-white hover:text-[#B4F26B]'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#B4F26B] rounded-full" />
                    )}
                  </a>
                );
              })}
            </nav>

            {/* Right Action Pill CTA Button with Circular Arrow Chip */}
            <div className="hidden md:flex items-center">
              <a
                href="#contact"
                className="btn-biztop-pill text-xs sm:text-sm shadow-md"
              >
                <span>Connect</span>
                <span className="arrow-chip">
                  <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </span>
              </a>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center shrink-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-white hover:text-[#B4F26B] hover:bg-white/10 transition-colors focus:outline-none focus-visible:outline-2 focus-visible:outline-[#B4F26B]"
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
              className="md:hidden bg-[#0A3D37] rounded-2xl border border-white/10 shadow-xl p-4 transition-all duration-200 animate-fadeIn"
            >
              <div className="space-y-1">
                {SITE_CONFIG.navigation.map((item) => {
                  const isActive = activeSection === item.id;
                  return (
                    <a
                      key={item.id}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                        isActive
                          ? 'text-[#06302B] bg-[#B4F26B]'
                          : 'text-white hover:text-[#B4F26B] hover:bg-white/5'
                      }`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <span>{item.label}</span>
                      {isActive && <span className="w-2 h-2 rounded-full bg-[#06302B]" />}
                    </a>
                  );
                })}
                
                <div className="pt-3 mt-2 border-t border-white/10">
                  <a
                    href="#contact"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-biztop-pill w-full justify-center text-sm shadow-md"
                  >
                    <span>Connect With NextGen</span>
                    <span className="arrow-chip">
                      <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
