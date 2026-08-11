"use client";

import { useRef, useEffect, useCallback } from "react";
import { MotionRegions } from "@/hooks/useMotionDetection";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  targetOpacity: number;
  hue: number;
  life: number;
  maxLife: number;
  type: "star" | "nebula" | "aurora";
}

interface ParticleOverlayProps {
  width: number;
  height: number;
  motion: MotionRegions;
  enhanced: boolean;
  isActive: boolean;
  mirrored?: boolean;
}

function createParticle(w: number, h: number, enhanced: boolean): Particle {
  const types: Particle["type"][] = enhanced
    ? ["star", "star", "star", "nebula", "aurora"]
    : ["star", "star", "star"];
  const type = types[Math.floor(Math.random() * types.length)];

  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.3,
    vy: -Math.random() * 0.5 - 0.1,
    size: type === "nebula" ? Math.random() * 40 + 20 : Math.random() * 3 + 1,
    opacity: 0,
    targetOpacity: type === "nebula" ? Math.random() * 0.15 + 0.05 : Math.random() * 0.7 + 0.3,
    hue: Math.random() * 60 + 240,
    life: 0,
    maxLife: Math.random() * 400 + 200,
    type,
  };
}

export default function ParticleOverlay({ width, height, motion, enhanced, isActive, mirrored = false }: ParticleOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const maxParticles = enhanced ? 150 : 50;

  const animate = useCallback(() => {
    rafRef.current = requestAnimationFrame(animate);
    frameCountRef.current++;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    // Add new particles
    const particles = particlesRef.current;
    if (particles.length < maxParticles && frameCountRef.current % 3 === 0) {
      particles.push(createParticle(width, height, enhanced));
    }

    // Update and draw
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life++;

      // Fade in/out
      const lifeRatio = p.life / p.maxLife;
      if (lifeRatio < 0.1) {
        p.opacity = p.targetOpacity * (lifeRatio / 0.1);
      } else if (lifeRatio > 0.85) {
        p.opacity = p.targetOpacity * ((1 - lifeRatio) / 0.15);
      } else {
        p.opacity = p.targetOpacity;
      }

      // Motion influence
      const dx = (motion.right - motion.left) * 80;
      const dy = (motion.bottom - motion.top) * 80;
      p.vx += dx * 0.001;
      p.vy += dy * 0.001;

      // Center motion burst
      if (motion.center > 0.2) {
        const cx = width / 2;
        const cy = height / 2;
        const distX = p.x - cx;
        const distY = p.y - cy;
        const dist = Math.sqrt(distX * distX + distY * distY);
        if (dist > 0) {
          p.vx += (distX / dist) * motion.center * 0.5;
          p.vy += (distY / dist) * motion.center * 0.5;
        }
      }

      // Apply velocity with friction
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.98;
      p.vy *= 0.98;

      // Wrap around
      if (p.x < -50) p.x = width + 50;
      if (p.x > width + 50) p.x = -50;
      if (p.y < -50) p.y = height + 50;
      if (p.y > height + 50) p.y = -50;

      // Remove dead particles
      if (p.life >= p.maxLife) {
        particles.splice(i, 1);
        continue;
      }

      // Draw based on type
      if (p.type === "star") {
        const breathe = Math.sin(frameCountRef.current * 0.02 + p.x * 0.01) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 60%, 80%, ${p.opacity * breathe})`;
        ctx.fill();

        // Glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 60%, 80%, ${p.opacity * breathe * 0.15})`;
        ctx.fill();
      } else if (p.type === "nebula" && enhanced) {
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        gradient.addColorStop(0, `hsla(${p.hue}, 50%, 60%, ${p.opacity * 0.3})`);
        gradient.addColorStop(1, `hsla(${p.hue}, 50%, 60%, 0)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
      } else if (p.type === "aurora" && enhanced) {
        const wave = Math.sin(frameCountRef.current * 0.01 + p.x * 0.005) * 20;
        ctx.beginPath();
        ctx.moveTo(p.x - 30, p.y + wave);
        ctx.quadraticCurveTo(p.x, p.y + wave - 10, p.x + 30, p.y + wave);
        ctx.strokeStyle = `hsla(${p.hue}, 70%, 60%, ${p.opacity * 0.3})`;
        ctx.lineWidth = p.size * 0.5;
        ctx.stroke();
      }
    }
  }, [width, height, motion, enhanced, maxParticles]);

  useEffect(() => {
    if (isActive) {
      particlesRef.current = [];
      rafRef.current = requestAnimationFrame(animate);
    }
    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [isActive, animate]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="cosmic-camera-particles"
    />
  );
}
