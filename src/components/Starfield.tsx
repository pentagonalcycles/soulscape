"use client";

import { useEffect, useRef, useState } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  hue: number;
  layer: 0 | 1 | 2;
  twinkleClass: string;
}

export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mql.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.scale(dpr, dpr);

      // Fewer stars for better performance
      const total = Math.floor((w * h) / 6000);
      const hueRanges = [170, 180, 165, 175, 185, 160];

      for (let i = 0; i < total; i++) {
        const rand = Math.random();
        let layer: 0 | 1 | 2;
        let size: number;
        let opacity: number;

        if (rand < 0.65) {
          layer = 0;
          size = Math.random() * 0.7 + 0.3;
          opacity = Math.random() * 0.3 + 0.08;
        } else if (rand < 0.92) {
          layer = 1;
          size = Math.random() * 1.0 + 0.5;
          opacity = Math.random() * 0.4 + 0.15;
        } else {
          layer = 2;
          size = Math.random() * 1.5 + 0.8;
          opacity = Math.random() * 0.5 + 0.3;
        }

        const x = Math.random() * w;
        const y = Math.random() * h;
        const hue = hueRanges[Math.floor(Math.random() * hueRanges.length)];
        const sat = layer === 2 ? 70 : layer === 1 ? 50 : 40;
        const light = layer === 2 ? 85 : layer === 1 ? 75 : 70;

        // Draw star
        ctx.fillStyle = `hsla(${hue}, ${sat}%, ${light}%, ${opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();

        // Glow for bright stars
        if (layer === 2 && size > 1.2) {
          ctx.fillStyle = `hsla(${hue}, 80%, 70%, ${opacity * 0.1})`;
          ctx.beginPath();
          ctx.arc(x, y, size * 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    render();

    // Only re-render on resize
    window.addEventListener("resize", render);
    return () => window.removeEventListener("resize", render);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 1,
        // CSS-based twinkle via opacity animation on the whole canvas
        animation: prefersReducedMotion ? "none" : "starfieldTwinkle 8s ease-in-out infinite",
      }}
    />
  );
}
