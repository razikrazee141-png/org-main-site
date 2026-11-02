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

    // Mouse coordinates for interactive reactivity
    const mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      radius: 140,
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

    // NextGen brand atmospheric gradient orbs
    const orbs = [
      { x: width * 0.25, y: height * 0.25, radius: 320, color: '18, 94, 162', vx: 0.22, vy: 0.16, phase: 0 },
      { x: width * 0.8, y: height * 0.2, radius: 290, color: '56, 142, 60', vx: -0.18, vy: 0.18, phase: 1.5 },
      { x: width * 0.3, y: height * 0.8, radius: 270, color: '255, 167, 38', vx: 0.16, vy: -0.15, phase: 3 },
      { x: width * 0.85, y: height * 0.75, radius: 260, color: '237, 41, 36', vx: -0.15, vy: -0.18, phase: 4.5 },
    ];

    // Constellation high-tech particles
    const particleCount = Math.min(38, Math.floor(width / 35));
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      baseAlpha: number;
    }> = [];

    const brandColors = [
      'rgba(18, 94, 162,', // Blue
      'rgba(56, 142, 60,', // Green
      'rgba(255, 167, 38,', // Amber
      'rgba(14, 165, 233,', // Sky
    ];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        size: Math.random() * 2 + 1.2,
        color: brandColors[i % brandColors.length],
        baseAlpha: Math.random() * 0.35 + 0.15,
      });
    }

    let t = 0;

    const render = () => {
      // Smooth mouse interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.1;
      mouse.y += (mouse.targetY - mouse.y) * 0.1;

      t += 0.003;
      ctx.clearRect(0, 0, width, height);

      // 1. Draw glowing atmospheric radial orbs
      orbs.forEach((orb) => {
        const cx = orb.x + Math.sin(t + orb.phase) * 65;
        const cy = orb.y + Math.cos(t * 0.85 + orb.phase) * 55;

        const gradient = ctx.createRadialGradient(cx, cy, 10, cx, cy, orb.radius);
        gradient.addColorStop(0, `rgba(${orb.color}, 0.085)`);
        gradient.addColorStop(0.55, `rgba(${orb.color}, 0.03)`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cx, cy, orb.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. Mouse cursor interactive atmospheric glow spotlight
      if (mouse.x > 0 && mouse.y > 0) {
        const mouseGlow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 180);
        mouseGlow.addColorStop(0, 'rgba(18, 94, 162, 0.07)');
        mouseGlow.addColorStop(0.6, 'rgba(56, 142, 60, 0.025)');
        mouseGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = mouseGlow;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 180, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Connect particles with delicate lines
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];

        // Move
        p1.x += p1.vx;
        p1.y += p1.vy;

        // Wrap edges smoothly
        if (p1.x < -20) p1.x = width + 20;
        if (p1.x > width + 20) p1.x = -20;
        if (p1.y < -20) p1.y = height + 20;
        if (p1.y > height + 20) p1.y = -20;

        // Repel or attract slightly towards mouse
        const dxMouse = mouse.x - p1.x;
        const dyMouse = mouse.y - p1.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
        if (distMouse < mouse.radius && distMouse > 0) {
          const force = (mouse.radius - distMouse) / mouse.radius;
          p1.x -= (dxMouse / distMouse) * force * 1.5;
          p1.y -= (dyMouse / distMouse) * force * 1.5;
        }

        // Draw particle dot
        ctx.fillStyle = `${p1.color} ${p1.baseAlpha})`;
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.size, 0, Math.PI * 2);
        ctx.fill();

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 115) {
            const alpha = (1 - dist / 115) * 0.16;
            ctx.strokeStyle = `rgba(18, 94, 162, ${alpha})`;
            ctx.lineWidth = 0.75;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
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
      className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-90 transition-opacity"
      aria-hidden="true"
    />
  );
};
