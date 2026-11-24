import React, { useEffect, useRef } from 'react';

export const InteractiveBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.targetX = -1000;
      mouse.targetY = -1000;
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    // Biztop ambient orbs (Deep forest green & soft lime accents)
    const orbs = [
      { x: width * 0.2, y: height * 0.25, radius: 380, color: '6, 48, 43', vx: 0.1, vy: 0.08, phase: 0 },
      { x: width * 0.85, y: height * 0.35, radius: 340, color: '180, 242, 107', vx: -0.08, vy: 0.1, phase: 1.8 },
      { x: width * 0.45, y: height * 0.85, radius: 320, color: '6, 48, 43', vx: 0.08, vy: -0.09, phase: 3.4 },
    ];

    // Subtle floating stardust constellation nodes
    const particleCount = Math.min(32, Math.max(14, Math.floor(width / 50)));
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      radius: Math.random() * 1.5 + 1,
      alpha: Math.random() * 0.3 + 0.15,
    }));

    let t = 0;

    const render = () => {
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      t += 0.002;
      ctx.clearRect(0, 0, width, height);

      // Render soft glowing ambient orbs
      orbs.forEach((orb) => {
        const cx = orb.x + Math.sin(t + orb.phase) * 50;
        const cy = orb.y + Math.cos(t * 0.8 + orb.phase) * 40;

        const gradient = ctx.createRadialGradient(cx, cy, 10, cx, cy, orb.radius);
        gradient.addColorStop(0, `rgba(${orb.color}, 0.045)`);
        gradient.addColorStop(0.6, `rgba(${orb.color}, 0.015)`);
        gradient.addColorStop(1, 'rgba(247, 246, 236, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cx, cy, orb.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Render drifting particles & connecting filaments
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Wrap edges
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Mouse gentle magnetic deflection
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140) {
          const force = (1 - dist / 140) * 0.6;
          p.x += dx * force * 0.02;
          p.y += dy * force * 0.02;
        }

        // Draw particle dot
        ctx.fillStyle = `rgba(180, 242, 107, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist2 = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist2 < 85) {
            ctx.strokeStyle = `rgba(180, 242, 107, ${(1 - dist2 / 85) * 0.12})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-70"
      aria-hidden="true"
    />
  );
};
