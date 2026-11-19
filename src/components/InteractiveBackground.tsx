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
      radius: 120,
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
      { x: width * 0.2, y: height * 0.2, radius: 360, color: '6, 48, 43', vx: 0.1, vy: 0.08, phase: 0 },
      { x: width * 0.85, y: height * 0.3, radius: 320, color: '180, 242, 107', vx: -0.08, vy: 0.1, phase: 1.8 },
      { x: width * 0.45, y: height * 0.85, radius: 300, color: '6, 48, 43', vx: 0.08, vy: -0.09, phase: 3.4 },
    ];

    let t = 0;

    const render = () => {
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      t += 0.002;
      ctx.clearRect(0, 0, width, height);

      orbs.forEach((orb) => {
        const cx = orb.x + Math.sin(t + orb.phase) * 45;
        const cy = orb.y + Math.cos(t * 0.8 + orb.phase) * 35;

        const gradient = ctx.createRadialGradient(cx, cy, 10, cx, cy, orb.radius);
        gradient.addColorStop(0, `rgba(${orb.color}, 0.04)`);
        gradient.addColorStop(0.6, `rgba(${orb.color}, 0.01)`);
        gradient.addColorStop(1, 'rgba(247, 246, 236, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cx, cy, orb.radius, 0, Math.PI * 2);
        ctx.fill();
      });

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
      className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-60"
      aria-hidden="true"
    />
  );
};
