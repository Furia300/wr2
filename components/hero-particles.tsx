"use client";

import { useEffect, useRef } from "react";

export function HeroParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Only run on desktop
    if (typeof window === "undefined" || window.innerWidth <= 1023) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let mouseX = 0;
    let mouseY = 0;

    interface Trail {
      x: number;
      y: number;
      life: number;
      decay: number;
      size: number;
    }

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
    }

    const trails: Trail[] = [];
    const particles: Particle[] = [];

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = 630;
    }
    resize();
    window.addEventListener("resize", resize);

    // Create 150 floating particles
    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        size: Math.random() * 3 + 2,
        opacity: Math.random() * 0.7 + 0.3,
      });
    }

    function drawConnections() {
      if (!ctx) return;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.save();
            ctx.strokeStyle = "#8A898B";
            ctx.globalAlpha = ((120 - dist) / 120) * 0.4;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
            ctx.restore();
          }
        }
        // Connect to mouse
        const dx = particles[i].x - mouseX;
        const dy = particles[i].y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140) {
          ctx.save();
          ctx.strokeStyle = "#8A898B";
          ctx.globalAlpha = ((140 - dist) / 140) * 0.6;
          ctx.lineWidth = 2;
          ctx.shadowBlur = 10;
          ctx.shadowColor = "#8A898B";
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouseX, mouseY);
          ctx.stroke();
          ctx.restore();
        }
      }
    }

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update & draw particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas!.width;
        if (p.x > canvas!.width) p.x = 0;
        if (p.y < 0) p.y = canvas!.height;
        if (p.y > canvas!.height) p.y = 0;

        // Soft attraction to mouse
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          const force = ((150 - dist) / 150) * 0.0008;
          p.vx += dx * force;
          p.vy += dy * force;
        }
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 0.4) {
          p.vx = (p.vx / speed) * 0.4;
          p.vy = (p.vy / speed) * 0.4;
        }

        ctx!.save();
        ctx!.globalAlpha = p.opacity;
        ctx!.fillStyle = "#8A898B";
        ctx!.shadowBlur = 8;
        ctx!.shadowColor = "#8A898B";
        ctx!.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        ctx!.restore();
      });

      drawConnections();

      // Update & draw trails
      for (let i = trails.length - 1; i >= 0; i--) {
        const t = trails[i];
        t.life -= t.decay;
        if (t.life <= 0) {
          trails.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = t.life;
        ctx.fillStyle = "#8A898B";
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#8A898B";
        ctx.fillRect(t.x - t.size / 2, t.y - t.size / 2, t.size, t.size);
        ctx.restore();
      }

      animId = requestAnimationFrame(animate);
    }

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    const onClick = (e: MouseEvent) => {
      for (let i = 0; i < 10; i++) {
        trails.push({
          x: e.clientX + (Math.random() - 0.5) * 20,
          y: e.clientY + (Math.random() - 0.5) * 20,
          life: 1,
          decay: 0.02,
          size: Math.random() * 3 + 1,
        });
      }
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("click", onClick);
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full z-10 pointer-events-none hidden lg:block"
      style={{ height: 630 }}
    />
  );
}
