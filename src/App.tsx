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

export const App: React.FC = () => {
  const [isAdminView, setIsAdminView] = useState(() => {
    return (
      window.location.pathname === '/admin' ||
      window.location.pathname === '/admin/' ||
      new URLSearchParams(window.location.search).get('view') === 'admin'
    );
  });

  useEffect(() => {
    const handlePopState = () => {
      setIsAdminView(
        window.location.pathname === '/admin' ||
        window.location.pathname === '/admin/' ||
        new URLSearchParams(window.location.search).get('view') === 'admin'
      );
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (isAdminView) {
    return <AdminInbox />;
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-[#FAF9F6] text-[#0F172A] selection:bg-[#125EA2] selection:text-white w-full overflow-x-hidden">
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
    </div>
  );
};

export default App;
