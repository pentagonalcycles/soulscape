"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  layer: 0 | 1 | 2;
  hue: number;
}

export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>(0);

  useEffect(() => {
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
      const total = Math.floor((w * h) / 3500);
      const stars: Star[] = [];

      const hueRanges = [
        170 + Math.random() * 30,  // teal
        180 + Math.random() * 20,  // cyan
        160 + Math.random() * 20,  // emerald
        175 + Math.random() * 15,  // aqua
        185 + Math.random() * 15,  // light cyan
        165 + Math.random() * 25,  // mint
      ];

      for (let i = 0; i < total; i++) {
        const rand = Math.random();
        let layer: 0 | 1 | 2;
        let size: number;
        let opacity: number;
        let speed: number;

        if (rand < 0.65) {
          layer = 0;
          size = Math.random() * 0.8 + 0.3;
          opacity = Math.random() * 0.35 + 0.08;
          speed = Math.random() * 0.15 + 0.05;
        } else if (rand < 0.92) {
          layer = 1;
          size = Math.random() * 1.2 + 0.6;
          opacity = Math.random() * 0.45 + 0.15;
          speed = Math.random() * 0.25 + 0.1;
        } else {
          layer = 2;
          size = Math.random() * 1.8 + 1.0;
          opacity = Math.random() * 0.55 + 0.35;
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
          hue: hueRanges[Math.floor(Math.random() * hueRanges.length)],
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

      for (let i = 0; i < starsRef.current.length; i++) {
        const star = starsRef.current[i];
        const parallaxMultiplier = star.layer === 0 ? 0.3 : star.layer === 1 ? 0.6 : 1.0;
        const parallaxX = mx * star.speed * parallaxMultiplier;
        const parallaxY = my * star.speed * parallaxMultiplier;
        const driftX = Math.sin(time * 0.04 + star.twinkleOffset) * star.speed * 12;
        const driftY = -time * star.speed * 3;
        const drawX = ((star.x + parallaxX + driftX) % w + w) % w;
        const drawY = ((star.y + parallaxY + driftY) % h + h) % h;
        const twinkle =
          Math.sin(time * star.twinkleSpeed * 30 + star.twinkleOffset) * 0.3 + 0.7;

        const sat = star.layer === 2 ? "70%" : star.layer === 1 ? "50%" : "40%";
        const light = star.layer === 2 ? "85%" : star.layer === 1 ? "75%" : "70%";
        ctx.fillStyle = `hsla(${star.hue}, ${sat}, ${light}, ${star.opacity * twinkle})`;
        ctx.beginPath();
        ctx.arc(drawX, drawY, star.size, 0, Math.PI * 2);
        ctx.fill();

        if (star.layer === 2 && star.size > 1.4) {
          ctx.fillStyle = `hsla(${star.hue}, 80%, 70%, ${star.opacity * twinkle * 0.12})`;
          ctx.beginPath();
          ctx.arc(drawX, drawY, star.size * 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

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
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}
