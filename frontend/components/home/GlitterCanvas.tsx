"use client";

import React, { useRef, useEffect, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  decay: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
}

const GLITTER_COLORS = [
  "#ffffff",
  "#01A7E5",
  "#c084fc",
  "#34d399",
  "#a5f3fc",
  "#fbbf24",
  "#f9a8d4",
];

export default function GlitterCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);
  const lastSpawnRef = useRef<number>(0);

  const spawnParticles = useCallback((x: number, y: number) => {
    const now = performance.now();
    // Throttle spawning to every ~18ms for smooth but not overwhelming particle count
    if (now - lastSpawnRef.current < 18) return;
    lastSpawnRef.current = now;

    const count = 3 + Math.floor(Math.random() * 3); // 3-5 particles per move event
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.3 + Math.random() * 1.2;
      particlesRef.current.push({
        x: x + (Math.random() - 0.5) * 14,
        y: y + (Math.random() - 0.5) * 14,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.3, // slight upward bias
        size: 1.2 + Math.random() * 2.8,
        opacity: 0.7 + Math.random() * 0.3,
        decay: 0.008 + Math.random() * 0.012,
        color: GLITTER_COLORS[Math.floor(Math.random() * GLITTER_COLORS.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 6,
      });
    }

    // Cap particle count to prevent performance issues
    if (particlesRef.current.length > 300) {
      particlesRef.current = particlesRef.current.slice(-200);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = parent.clientWidth * dpr;
      canvas.height = parent.clientHeight * dpr;
      canvas.style.width = `${parent.clientWidth}px`;
      canvas.style.height = `${parent.clientHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      spawnParticles(x, y);
    };

    canvas.addEventListener("mousemove", handleMouseMove);

    // Draw a 4-point star / sparkle shape
    const drawSparkle = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      rotation: number,
      color: string,
      opacity: number
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.globalAlpha = opacity;

      // Outer glow
      ctx.shadowColor = color;
      ctx.shadowBlur = size * 2.5;

      ctx.fillStyle = color;
      ctx.beginPath();

      // 4-pointed star
      const innerRadius = size * 0.25;
      const outerRadius = size;
      for (let i = 0; i < 8; i++) {
        const r = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i * Math.PI) / 4 - Math.PI / 2;
        const px = Math.cos(angle) * r;
        const py = Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    };

    const animate = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const w = parent.clientWidth;
      const h = parent.clientHeight;

      ctx.clearRect(0, 0, w, h);

      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.008; // gentle gravity
        p.opacity -= p.decay;
        p.rotation += p.rotationSpeed;

        // Twinkle: modulate opacity with a sine wave
        const twinkle = Math.sin(performance.now() * 0.008 + i) * 0.15;
        const drawOpacity = Math.max(0, Math.min(1, p.opacity + twinkle));

        if (p.opacity <= 0) {
          particles.splice(i, 1);
          continue;
        }

        drawSparkle(ctx, p.x, p.y, p.size, p.rotation, p.color, drawOpacity);
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      canvas.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", resize);
    };
  }, [spawnParticles]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-[5] pointer-events-auto"
      style={{ mixBlendMode: "screen" }}
      aria-hidden="true"
    />
  );
}
