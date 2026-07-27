"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "./AuthProvider";

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  layer: 0 | 1 | 2;
  blur: number;
}

export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>(0);
  const { userPreferences } = useAuth();

  useEffect(() => {
    if (!userPreferences.show_starfield) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
      initStars();
    };

    const initStars = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const total = Math.floor((w * h) / 2500);
      const stars: Star[] = [];

      for (let i = 0; i < total; i++) {
        const rand = Math.random();
        let layer: 0 | 1 | 2;
        let size: number;
        let opacity: number;
        let blur: number;
        let speed: number;

        if (rand < 0.6) {
          // Layer 0: tiny distant stars
          layer = 0;
          size = Math.random() * 0.8 + 0.3;
          opacity = Math.random() * 0.4 + 0.1;
          blur = 0;
          speed = Math.random() * 0.15 + 0.05;
        } else if (rand < 0.9) {
          // Layer 1: soft mid-distance particles
          layer = 1;
          size = Math.random() * 1.2 + 0.6;
          opacity = Math.random() * 0.5 + 0.2;
          blur = 0.5;
          speed = Math.random() * 0.25 + 0.1;
        } else {
          // Layer 2: bright foreground lights
          layer = 2;
          size = Math.random() * 1.8 + 1.0;
          opacity = Math.random() * 0.6 + 0.4;
          blur = 0;
          speed = Math.random() * 0.35 + 0.15;
        }

        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          size,
          opacity,
          speed,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          twinkleOffset: Math.random() * Math.PI * 2,
          layer,
          blur,
        });
      }

      starsRef.current = stars;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 20;
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 20;
    };

    const animate = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      const time = Date.now() * 0.001;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      starsRef.current.forEach((star) => {
        const parallaxMultiplier = star.layer === 0 ? 0.3 : star.layer === 1 ? 0.6 : 1.0;
        const parallaxX = mx * star.speed * parallaxMultiplier;
        const parallaxY = my * star.speed * parallaxMultiplier;
        const driftX = Math.sin(time * 0.08 + star.twinkleOffset) * star.speed * 12;
        const driftY = -time * star.speed * 6;
        const drawX = ((star.x + parallaxX + driftX) % w + w) % w;
        const drawY = ((star.y + parallaxY + driftY) % h + h) % h;
        const twinkle =
          Math.sin(time * star.twinkleSpeed * 60 + star.twinkleOffset) * 0.3 + 0.7;

        if (star.blur > 0) {
          ctx.filter = `blur(${star.blur}px)`;
        } else {
          ctx.filter = "none";
        }

        ctx.beginPath();
        ctx.arc(drawX, drawY, star.size, 0, Math.PI * 2);

        if (star.layer === 2) {
          ctx.fillStyle = `rgba(200, 195, 230, ${star.opacity * twinkle})`;
        } else if (star.layer === 1) {
          ctx.fillStyle = `rgba(190, 185, 220, ${star.opacity * twinkle})`;
        } else {
          ctx.fillStyle = `rgba(180, 175, 210, ${star.opacity * twinkle})`;
        }
        ctx.fill();

        // Glow on bright foreground stars
        if (star.layer === 2 && star.size > 1.4) {
          ctx.beginPath();
          ctx.arc(drawX, drawY, star.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(157, 124, 216, ${star.opacity * twinkle * 0.1})`;
          ctx.fill();
        }
      });

      ctx.filter = "none";
      animationRef.current = requestAnimationFrame(animate);
    };

    resize();
    animate();

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [userPreferences.show_starfield]);

  if (!userPreferences.show_starfield) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}
