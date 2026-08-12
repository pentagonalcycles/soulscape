"use client";

import { useEffect, useRef, useCallback } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  baseOpacity: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  layer: 0 | 1 | 2 | 3;
  hue: number;
  saturation: number;
  lightness: number;
  hasMessage: boolean;
  messageId: string | null;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

interface StargazingCanvasProps {
  messageStars: { id: string }[];
  onStarClick: (id: string) => void;
}

export default function StargazingCanvas({ messageStars, onStarClick }: StargazingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>(0);
  const lastShootingStarRef = useRef(0);
  const messageStarsRef = useRef(messageStars);

  useEffect(() => {
    messageStarsRef.current = messageStars;
  }, [messageStars]);

  const initStars = useCallback(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const total = Math.floor((w * h) / 2000);
    const stars: Star[] = [];

    const msgCount = messageStarsRef.current.length;
    const msgIndices = new Set<number>();
    while (msgIndices.size < Math.min(msgCount, 80)) {
      msgIndices.add(Math.floor(Math.random() * total));
    }

    for (let i = 0; i < total; i++) {
      const rand = Math.random();
      let layer: 0 | 1 | 2 | 3;
      let size: number;
      let baseOpacity: number;
      let hue: number;
      let sat: number;
      let light: number;

      const temp = Math.random();
      if (temp < 0.3) {
        hue = 210 + Math.random() * 30;
        sat = 30 + Math.random() * 40;
        light = 75 + Math.random() * 20;
      } else if (temp < 0.6) {
        hue = 40 + Math.random() * 20;
        sat = 20 + Math.random() * 30;
        light = 85 + Math.random() * 15;
      } else if (temp < 0.85) {
        hue = 0;
        sat = 0;
        light = 90 + Math.random() * 10;
      } else {
        hue = 180 + Math.random() * 40;
        sat = 40 + Math.random() * 30;
        light = 70 + Math.random() * 25;
      }

      if (rand < 0.6) {
        layer = 0;
        size = Math.random() * 0.5 + 0.2;
        baseOpacity = Math.random() * 0.3 + 0.05;
      } else if (rand < 0.85) {
        layer = 1;
        size = Math.random() * 0.8 + 0.4;
        baseOpacity = Math.random() * 0.4 + 0.15;
      } else if (rand < 0.96) {
        layer = 2;
        size = Math.random() * 1.2 + 0.8;
        baseOpacity = Math.random() * 0.5 + 0.3;
      } else {
        layer = 3;
        size = Math.random() * 2.0 + 1.2;
        baseOpacity = Math.random() * 0.4 + 0.5;
      }

      const hasMessage = msgIndices.has(i);
      const msgIdx = hasMessage ? [...msgIndices].indexOf(i) : -1;

      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size,
        baseOpacity,
        twinkleSpeed: Math.random() * 0.015 + 0.003,
        twinkleOffset: Math.random() * Math.PI * 2,
        layer,
        hue,
        saturation: sat,
        lightness: light,
        hasMessage,
        messageId: hasMessage && msgIdx < messageStarsRef.current.length
          ? messageStarsRef.current[msgIdx].id
          : null,
      });
    }

    starsRef.current = stars;
  }, []);

  const spawnShootingStar = useCallback(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const angle = Math.random() * 0.5 + 0.3;
    const speed = 8 + Math.random() * 12;

    shootingStarsRef.current.push({
      x: Math.random() * w * 0.8,
      y: Math.random() * h * 0.3,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0,
      maxLife: 40 + Math.random() * 30,
      size: 1.5 + Math.random() * 1.5,
    });
  }, []);

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

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const handleClick = (e: MouseEvent | TouchEvent) => {
      const mx = "clientX" in e ? e.clientX : e.changedTouches[0]?.clientX ?? 0;
      const my = "clientY" in e ? e.clientY : e.changedTouches[0]?.clientY ?? 0;
      const time = Date.now() * 0.001;
      const mX = mouseRef.current.x;
      const mY = mouseRef.current.y;

      let closest: Star | null = null;
      let closestDist = 25;

      for (const star of starsRef.current) {
        if (!star.hasMessage || !star.messageId) continue;

        const px = star.layer === 0 ? 2 : star.layer === 1 ? 5 : star.layer === 2 ? 8 : 12;
        const parallaxX = mX * px;
        const parallaxY = mY * px;
        const driftX = Math.sin(time * 0.03 + star.twinkleOffset) * 3;
        const driftY = Math.cos(time * 0.02 + star.twinkleOffset * 0.7) * 2;
        const drawX = star.x + parallaxX + driftX;
        const drawY = star.y + parallaxY + driftY;

        const dist = Math.hypot(drawX - mx, drawY - my);
        if (dist < closestDist) {
          closestDist = dist;
          closest = star;
        }
      }

      if (closest && closest.messageId) {
        onStarClick(closest.messageId);
      }
    };

    const animate = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const time = Date.now() * 0.001;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      ctx.clearRect(0, 0, w, h);

      // Background gradient
      const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.4, 0, w * 0.5, h * 0.5, w * 0.7);
      bgGrad.addColorStop(0, "#0a0a1a");
      bgGrad.addColorStop(0.5, "#060612");
      bgGrad.addColorStop(1, "#020208");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Nebula dust
      const nebula1 = ctx.createRadialGradient(w * 0.2, h * 0.3, 0, w * 0.2, h * 0.3, w * 0.25);
      nebula1.addColorStop(0, "rgba(13, 148, 136, 0.015)");
      nebula1.addColorStop(1, "transparent");
      ctx.fillStyle = nebula1;
      ctx.fillRect(0, 0, w, h);

      const nebula2 = ctx.createRadialGradient(w * 0.75, h * 0.6, 0, w * 0.75, h * 0.6, w * 0.2);
      nebula2.addColorStop(0, "rgba(100, 50, 200, 0.012)");
      nebula2.addColorStop(1, "transparent");
      ctx.fillStyle = nebula2;
      ctx.fillRect(0, 0, w, h);

      // Draw Milky Way band
      ctx.save();
      ctx.translate(w * 0.5, h * 0.5);
      ctx.rotate(-0.3);
      const milkyGrad = ctx.createLinearGradient(-w * 0.6, 0, w * 0.6, 0);
      milkyGrad.addColorStop(0, "transparent");
      milkyGrad.addColorStop(0.3, "rgba(180, 190, 220, 0.008)");
      milkyGrad.addColorStop(0.5, "rgba(180, 190, 220, 0.015)");
      milkyGrad.addColorStop(0.7, "rgba(180, 190, 220, 0.008)");
      milkyGrad.addColorStop(1, "transparent");
      ctx.fillStyle = milkyGrad;
      ctx.fillRect(-w, -h * 0.15, w * 2, h * 0.3);
      ctx.restore();

      // Draw stars
      for (const star of starsRef.current) {
        const px = star.layer === 0 ? 2 : star.layer === 1 ? 5 : star.layer === 2 ? 8 : 12;
        const parallaxX = mx * px;
        const parallaxY = my * px;
        const driftX = Math.sin(time * 0.03 + star.twinkleOffset) * 3;
        const driftY = Math.cos(time * 0.02 + star.twinkleOffset * 0.7) * 2;
        let drawX = ((star.x + parallaxX + driftX) % w + w) % w;
        let drawY = ((star.y + parallaxY + driftY) % h + h) % h;

        const twinkle = Math.sin(time * star.twinkleSpeed * 60 + star.twinkleOffset) * 0.35 + 0.65;
        const opacity = star.baseOpacity * twinkle;

        // Message star glow
        if (star.hasMessage) {
          const pulseSize = star.size * 4 + Math.sin(time * 1.5 + star.twinkleOffset) * 1.5;
          ctx.fillStyle = `hsla(${star.hue}, ${star.saturation}%, ${star.lightness}%, ${opacity * 0.08})`;
          ctx.beginPath();
          ctx.arc(drawX, drawY, pulseSize, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = `hsla(${star.hue}, ${star.saturation}%, ${star.lightness}%, ${opacity * 0.15})`;
          ctx.beginPath();
          ctx.arc(drawX, drawY, star.size * 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Star core
        ctx.fillStyle = `hsla(${star.hue}, ${star.saturation}%, ${star.lightness}%, ${opacity})`;
        ctx.beginPath();
        ctx.arc(drawX, drawY, star.size, 0, Math.PI * 2);
        ctx.fill();

        // Diffraction spikes for bright stars
        if (star.layer >= 2 && star.size > 1.0) {
          const spikeLen = star.size * 6 * twinkle;
          const spikeOpacity = opacity * 0.2;
          ctx.strokeStyle = `hsla(${star.hue}, ${star.saturation}%, ${star.lightness}%, ${spikeOpacity})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(drawX - spikeLen, drawY);
          ctx.lineTo(drawX + spikeLen, drawY);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(drawX, drawY - spikeLen);
          ctx.lineTo(drawX, drawY + spikeLen);
          ctx.stroke();
        }

        // Glow halo for very bright stars
        if (star.layer === 3 && star.size > 1.5) {
          const glowGrad = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, star.size * 8);
          glowGrad.addColorStop(0, `hsla(${star.hue}, ${star.saturation}%, ${star.lightness}%, ${opacity * 0.06})`);
          glowGrad.addColorStop(1, "transparent");
          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.arc(drawX, drawY, star.size * 8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Shooting stars
      const now = Date.now();
      if (now - lastShootingStarRef.current > 8000 + Math.random() * 15000) {
        spawnShootingStar();
        lastShootingStarRef.current = now;
      }

      for (let i = shootingStarsRef.current.length - 1; i >= 0; i--) {
        const s = shootingStarsRef.current[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life++;

        const progress = s.life / s.maxLife;
        const alpha = progress < 0.1 ? progress * 10 : 1 - (progress - 0.1) / 0.9;

        const tailLen = 60;
        const grad = ctx.createLinearGradient(
          s.x, s.y,
          s.x - s.vx * tailLen * 0.3, s.y - s.vy * tailLen * 0.3
        );
        grad.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.8})`);
        grad.addColorStop(0.3, `rgba(200, 220, 255, ${alpha * 0.4})`);
        grad.addColorStop(1, "transparent");

        ctx.strokeStyle = grad;
        ctx.lineWidth = s.size;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * tailLen * 0.3, s.y - s.vy * tailLen * 0.3);
        ctx.stroke();

        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * 0.8, 0, Math.PI * 2);
        ctx.fill();

        if (s.life > s.maxLife) {
          shootingStarsRef.current.splice(i, 1);
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    resize();
    animate();

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("click", handleClick);
    canvas.addEventListener("touchend", handleClick);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("click", handleClick);
      canvas.removeEventListener("touchend", handleClick);
    };
  }, [initStars, spawnShootingStar, onStarClick]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0"
      style={{ zIndex: 0, cursor: "crosshair", touchAction: "none" }}
    />
  );
}
