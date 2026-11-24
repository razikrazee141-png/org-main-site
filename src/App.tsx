import React, { useState, useEffect } from 'react';
import { InteractiveBackground } from './components/InteractiveBackground';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AboutSection } from './components/AboutSection';
import { FocusAreas } from './components/FocusAreas';
import { VisionMission } from './components/VisionMission';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { AdminInbox } from './components/AdminInbox';
import { ScrollProgress } from './components/ScrollProgress';

export const App: React.FC = () => {
  const checkIsAdmin = () => {
    const normalized = window.location.pathname.replace(/\/+$/, '') || '/';
    return normalized === '/admin';
  };

  const [isAdminView, setIsAdminView] = useState<boolean>(checkIsAdmin);

  useEffect(() => {
    const handlePopState = () => {
      setIsAdminView(checkIsAdmin());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // High-performance scroll reveal observer
  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -30px 0px',
      }
    );

    const elements = document.querySelectorAll('.reveal, .reveal-scale');
    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight) {
        el.classList.add('is-revealed');
      } else {
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, [isAdminView]);

  if (isAdminView) {
    return <AdminInbox />;
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-[#F7F6EC] text-[#0B2B26] selection:bg-[#B4F26B] selection:text-[#06302B] w-full overflow-x-hidden font-sans">
      {/* High-performance atmospheric canvas background */}
      <InteractiveBackground />

      {/* Section A: Navigation */}
      <Navbar />

      {/* Main Corporate Experience */}
      <main className="flex-1 relative z-10 w-full overflow-x-hidden" id="main-content">
        {/* Section B: Hero */}
        <Hero />

        {/* Section C: About NextGen */}
        <AboutSection />

        {/* Section D: Focus Areas (5 specific disciplines) */}
        <FocusAreas />

        {/* Section E: Vision and Mission */}
        <VisionMission />

        {/* Section F: Official Contact */}
        <ContactSection />
      </main>

      {/* Section G: Footer */}
      <Footer />

      {/* Floating Apple-Style Circular Scroll Progress & Back to Top */}
      <ScrollProgress />
    </div>
  );
};

export default App;
