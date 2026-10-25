import React, { useEffect, useRef } from 'react';

export const InteractiveBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize, { passive: true });

    // NextGen brand colors in soft atmospheric orbs
    // Hex: #125EA2 (blue), #388E3C (green), #FFA726 (amber), #ED2924 (red)
    const orbs = [
      { x: width * 0.25, y: height * 0.3, radius: 280, color: '18, 94, 162', vx: 0.25, vy: 0.18, phase: 0 },
      { x: width * 0.75, y: height * 0.25, radius: 260, color: '56, 142, 60', vx: -0.22, vy: 0.22, phase: 1.5 },
      { x: width * 0.35, y: height * 0.75, radius: 240, color: '255, 167, 38', vx: 0.2, vy: -0.16, phase: 3 },
      { x: width * 0.8, y: height * 0.7, radius: 220, color: '237, 41, 36', vx: -0.18, vy: -0.2, phase: 4.5 },
    ];

    let t = 0;

    const render = () => {
      t += 0.004;
      ctx.clearRect(0, 0, width, height);

      // Render gentle layered radial gradients
      orbs.forEach((orb) => {
        const cx = orb.x + Math.sin(t + orb.phase) * 60;
        const cy = orb.y + Math.cos(t * 0.8 + orb.phase) * 50;

        const gradient = ctx.createRadialGradient(cx, cy, 10, cx, cy, orb.radius);
        gradient.addColorStop(0, `rgba(${orb.color}, 0.09)`);
        gradient.addColorStop(0.5, `rgba(${orb.color}, 0.035)`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

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
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-90"
      aria-hidden="true"
    />
  );
};
