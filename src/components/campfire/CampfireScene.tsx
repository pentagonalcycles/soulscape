"use client";

import { useRef, useEffect, useCallback } from "react";

type CampfireTheme = "dark" | "light";

interface CampfireSceneProps {
  isPlaying: boolean;
  theme?: CampfireTheme;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  color: string;
  wobble: number;
  wobbleSpeed: number;
}

interface FlameLayer {
  x: number;
  baseY: number;
  width: number;
  height: number;
  phase: number;
  speed: number;
  colorStops: [number, string][];
  turbulence: number;
}

export default function CampfireScene({ isPlaying, theme = "dark" }: CampfireSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const embersRef = useRef<Particle[]>([]);
  const sparksRef = useRef<Particle[]>([]);
  const smokeRef = useRef<Particle[]>([]);
  const flamesRef = useRef<FlameLayer[]>([]);
  const logsRef = useRef<{ x: number; y: number; w: number; h: number; angle: number; bark: number[] }[]>([]);

  const initScene = useCallback((w: number, h: number) => {
    const cx = w / 2;
    const baseY = h * 0.62;

    // Multi-layer flame system for realistic fire
    const flameConfigs: FlameLayer[] = [
      // Outer glow (widest, most transparent)
      {
        x: cx, baseY, width: 90, height: 140,
        phase: 0, speed: 0.015,
        colorStops: [[0, "rgba(245, 158, 11, 0.15)"], [0.4, "rgba(239, 68, 68, 0.08)"], [1, "transparent"]],
        turbulence: 12,
      },
      // Outer flame (red/orange)
      {
        x: cx - 8, baseY, width: 65, height: 120,
        phase: 1.2, speed: 0.022,
        colorStops: [[0, "rgba(239, 68, 68, 0.7)"], [0.5, "rgba(220, 38, 38, 0.4)"], [1, "transparent"]],
        turbulence: 10,
      },
      // Middle flame (orange)
      {
        x: cx + 5, baseY, width: 50, height: 110,
        phase: 2.5, speed: 0.028,
        colorStops: [[0, "rgba(249, 115, 22, 0.85)"], [0.5, "rgba(245, 158, 11, 0.5)"], [1, "transparent"]],
        turbulence: 8,
      },
      // Inner flame (bright yellow-orange)
      {
        x: cx - 3, baseY, width: 35, height: 95,
        phase: 3.8, speed: 0.033,
        colorStops: [[0, "rgba(251, 191, 36, 0.9)"], [0.4, "rgba(245, 158, 11, 0.7)"], [1, "transparent"]],
        turbulence: 6,
      },
      // Core flame (white-yellow)
      {
        x: cx + 2, baseY, width: 20, height: 70,
        phase: 5.1, speed: 0.04,
        colorStops: [[0, "rgba(255, 255, 220, 0.95)"], [0.3, "rgba(255, 230, 150, 0.7)"], [1, "transparent"]],
        turbulence: 4,
      },
      // Flickering tongues (fast, thin)
      {
        x: cx - 15, baseY, width: 18, height: 80,
        phase: 0.5, speed: 0.05,
        colorStops: [[0, "rgba(251, 191, 36, 0.6)"], [0.6, "rgba(249, 115, 22, 0.3)"], [1, "transparent"]],
        turbulence: 14,
      },
      {
        x: cx + 18, baseY, width: 15, height: 75,
        phase: 2.1, speed: 0.045,
        colorStops: [[0, "rgba(251, 191, 36, 0.5)"], [0.5, "rgba(239, 68, 68, 0.2)"], [1, "transparent"]],
        turbulence: 16,
      },
    ];
    flamesRef.current = flameConfigs;

    // Logs with bark texture data
    const barkPattern = () => Array.from({ length: 12 }, () => 0.6 + Math.random() * 0.4);
    logsRef.current = [
      { x: cx - 35, y: baseY + 8, w: 70, h: 14, angle: -0.18, bark: barkPattern() },
      { x: cx + 25, y: baseY + 10, w: 65, h: 12, angle: 0.25, bark: barkPattern() },
      { x: cx - 12, y: baseY + 12, w: 55, h: 13, angle: 0.08, bark: barkPattern() },
    ];

    embersRef.current = [];
    sparksRef.current = [];
    smokeRef.current = [];
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initScene(canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const baseY = h * 0.62;
      const time = Date.now() / 1000;

      ctx.clearRect(0, 0, w, h);

      // ---- THEME BACKGROUND ----
      if (theme === "light") {
        // Light sky gradient
        const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
        skyGrad.addColorStop(0, "#e8dfd0");
        skyGrad.addColorStop(0.4, "#d4c8b8");
        skyGrad.addColorStop(0.7, "#c0b0a0");
        skyGrad.addColorStop(1, "#a89880");
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, h);

        // Warm sunlight from above
        const sunGlow = ctx.createRadialGradient(cx * 0.7, h * 0.15, 0, cx * 0.7, h * 0.15, w * 0.5);
        sunGlow.addColorStop(0, "rgba(255, 230, 180, 0.25)");
        sunGlow.addColorStop(0.5, "rgba(255, 210, 150, 0.08)");
        sunGlow.addColorStop(1, "transparent");
        ctx.fillStyle = sunGlow;
        ctx.fillRect(0, 0, w, h);
      } else {
        // Dark night sky
        const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
        skyGrad.addColorStop(0, "#020210");
        skyGrad.addColorStop(0.3, "#050520");
        skyGrad.addColorStop(0.7, "#0a0a2e");
        skyGrad.addColorStop(1, "#10102e");
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, h);

        // Stars
        const starSeed = 42;
        for (let i = 0; i < 60; i++) {
          const sx = ((i * 7919 + starSeed) % w);
          const sy = ((i * 6271 + starSeed) % (h * 0.5));
          const twinkle = 0.3 + 0.7 * Math.abs(Math.sin(time * 0.5 + i * 0.7));
          ctx.fillStyle = `rgba(255, 255, 255, ${0.15 * twinkle})`;
          ctx.beginPath();
          ctx.arc(sx, sy, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ---- AMBIENT GROUND GLOW ----
      const groundGlow = ctx.createRadialGradient(cx, baseY + 20, 0, cx, baseY + 20, 350);
      groundGlow.addColorStop(0, `rgba(245, 158, 11, ${theme === "light" ? 0.25 : 0.2})`);
      groundGlow.addColorStop(0.3, `rgba(239, 68, 68, ${theme === "light" ? 0.1 : 0.08})`);
      groundGlow.addColorStop(0.7, `rgba(245, 158, 11, ${theme === "light" ? 0.05 : 0.03})`);
      groundGlow.addColorStop(1, "transparent");
      ctx.fillStyle = groundGlow;
      ctx.fillRect(0, 0, w, h);

      // ---- STONE RING ----
      const stoneRadius = 65;
      const stoneCount = 14;
      for (let i = 0; i < stoneCount; i++) {
        const angle = (i / stoneCount) * Math.PI * 2;
        const sx = cx + Math.cos(angle) * stoneRadius;
        const sy = baseY + 18 + Math.sin(angle) * (stoneRadius * 0.35);
        const stoneSize = 8 + Math.sin(i * 2.7) * 3;

        // Stone shadow
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.beginPath();
        ctx.ellipse(sx + 1, sy + 2, stoneSize + 1, stoneSize * 0.7 + 1, angle * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Stone body
        const stoneGrad = ctx.createRadialGradient(sx - 2, sy - 2, 0, sx, sy, stoneSize);
        stoneGrad.addColorStop(0, "#5a5a5a");
        stoneGrad.addColorStop(0.5, "#3d3d3d");
        stoneGrad.addColorStop(1, "#2a2a2a");
        ctx.fillStyle = stoneGrad;
        ctx.beginPath();
        ctx.ellipse(sx, sy, stoneSize, stoneSize * 0.7, angle * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Firelight on stone edge
        const facing = Math.cos(angle);
        if (facing > -0.3) {
          ctx.strokeStyle = `rgba(245, 158, 11, ${0.15 * facing})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.ellipse(sx, sy, stoneSize, stoneSize * 0.7, angle * 0.3, -0.5, 0.5);
          ctx.stroke();
        }
      }

      // ---- DIRT/SAND BASE ----
      const dirtGrad = ctx.createRadialGradient(cx, baseY + 15, 0, cx, baseY + 15, 80);
      dirtGrad.addColorStop(0, "rgba(60, 40, 20, 0.6)");
      dirtGrad.addColorStop(0.7, "rgba(40, 25, 12, 0.3)");
      dirtGrad.addColorStop(1, "transparent");
      ctx.fillStyle = dirtGrad;
      ctx.beginPath();
      ctx.ellipse(cx, baseY + 15, 80, 25, 0, 0, Math.PI * 2);
      ctx.fill();

      // ---- LOGS ----
      logsRef.current.forEach((log, idx) => {
        ctx.save();
        ctx.translate(log.x + log.w / 2, log.y + log.h / 2);
        ctx.rotate(log.angle);

        // Log shadow
        ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
        ctx.beginPath();
        ctx.ellipse(2, 3, log.w / 2 + 2, log.h / 2 + 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Log body with bark texture
        const logGrad = ctx.createLinearGradient(-log.w / 2, -log.h / 2, -log.w / 2, log.h / 2);
        logGrad.addColorStop(0, "#5a4030");
        logGrad.addColorStop(0.3, "#4a3220");
        logGrad.addColorStop(0.7, "#3a2515");
        logGrad.addColorStop(1, "#2d1a0d");
        ctx.fillStyle = logGrad;
        ctx.beginPath();
        ctx.roundRect(-log.w / 2, -log.h / 2, log.w, log.h, 5);
        ctx.fill();

        // Bark texture lines
        ctx.strokeStyle = "rgba(80, 55, 30, 0.4)";
        ctx.lineWidth = 0.8;
        for (let j = 0; j < log.bark.length; j++) {
          const bx = -log.w / 2 + (j / log.bark.length) * log.w;
          ctx.beginPath();
          ctx.moveTo(bx, -log.h / 2 + 2);
          ctx.lineTo(bx + 3, log.h / 2 - 2);
          ctx.stroke();
        }

        // Ember glow on log surface (pulsing)
        const emberIntensity = 0.15 + 0.1 * Math.sin(time * 2 + idx * 1.5);
        const emberGrad = ctx.createLinearGradient(0, -log.h / 2, 0, -log.h / 2 + log.h * 0.4);
        emberGrad.addColorStop(0, `rgba(255, 120, 20, ${emberIntensity})`);
        emberGrad.addColorStop(1, "transparent");
        ctx.fillStyle = emberGrad;
        ctx.beginPath();
        ctx.roundRect(-log.w / 2, -log.h / 2, log.w, log.h * 0.4, 5);
        ctx.fill();

        // Hot spots (small glowing areas)
        const hotSpots = [0.2, 0.5, 0.8];
        hotSpots.forEach((pos) => {
          const hx = -log.w / 2 + pos * log.w;
          const hy = -log.h / 2 + 3;
          const intensity = 0.3 + 0.2 * Math.sin(time * 3 + pos * 10);
          const hotGrad = ctx.createRadialGradient(hx, hy, 0, hx, hy, 8);
          hotGrad.addColorStop(0, `rgba(255, 180, 50, ${intensity})`);
          hotGrad.addColorStop(1, "transparent");
          ctx.fillStyle = hotGrad;
          ctx.beginPath();
          ctx.arc(hx, hy, 8, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.restore();
      });

      // ---- FLAME LAYERS ----
      flamesRef.current.forEach((flame) => {
        flame.phase += flame.speed;
        const flicker = Math.sin(flame.phase) * 0.25 + Math.sin(flame.phase * 2.7) * 0.12 + Math.sin(flame.phase * 4.1) * 0.06;
        const currentHeight = flame.height * (0.65 + flicker * 0.35);
        const currentWidth = flame.width * (0.75 + Math.sin(flame.phase * 1.8) * 0.25);

        ctx.save();
        ctx.translate(flame.x, flame.baseY);

        // Teardrop flame shape using bezier curves
        const flameGrad = ctx.createLinearGradient(0, 0, 0, -currentHeight);
        flame.colorStops.forEach(([stop, color]) => flameGrad.addColorStop(stop, color));

        ctx.fillStyle = flameGrad;
        ctx.beginPath();

        // Bottom center
        ctx.moveTo(0, 0);

        // Left curve (wider at base, tapers to tip)
        const turb = flame.turbulence;
        const wobbleL = Math.sin(time * 3.2 + flame.phase) * turb;
        const wobbleR = Math.sin(time * 2.8 + flame.phase + 1) * turb;
        const tipWobble = Math.sin(time * 4 + flame.phase) * turb * 0.6;

        ctx.bezierCurveTo(
          -currentWidth * 0.7 + wobbleL * 0.5, -currentHeight * 0.15,
          -currentWidth * 0.45 + wobbleL, -currentHeight * 0.5,
          tipWobble, -currentHeight
        );

        // Right curve
        ctx.bezierCurveTo(
          currentWidth * 0.45 + wobbleR, -currentHeight * 0.5,
          currentWidth * 0.7 + wobbleR * 0.5, -currentHeight * 0.15,
          0, 0
        );

        ctx.closePath();
        ctx.fill();

        // Additive glow overlay
        ctx.globalCompositeOperation = "screen";
        const glowGrad = ctx.createRadialGradient(0, -currentHeight * 0.3, 0, 0, -currentHeight * 0.3, currentWidth * 0.8);
        glowGrad.addColorStop(0, `rgba(255, 220, 100, ${0.15 + 0.05 * Math.sin(time * 5)})`);
        glowGrad.addColorStop(1, "transparent");
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(0, -currentHeight * 0.3, currentWidth * 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = "source-over";

        ctx.restore();
      });

      // ---- CENTRAL FIRE GLOW (pulsing) ----
      const pulseIntensity = 0.25 + 0.08 * Math.sin(time * 2.5) + 0.04 * Math.sin(time * 5.3);
      const fireGlow = ctx.createRadialGradient(cx, baseY - 30, 0, cx, baseY - 30, 250);
      fireGlow.addColorStop(0, `rgba(255, 200, 50, ${pulseIntensity})`);
      fireGlow.addColorStop(0.3, `rgba(255, 150, 30, ${pulseIntensity * 0.5})`);
      fireGlow.addColorStop(0.7, `rgba(245, 100, 20, ${pulseIntensity * 0.15})`);
      fireGlow.addColorStop(1, "transparent");
      ctx.fillStyle = fireGlow;
      ctx.fillRect(0, 0, w, h);

      // ---- SMOKE ----
      const smoke = smokeRef.current;
      if (smoke.length < 25 && Math.random() > 0.85) {
        smoke.push({
          x: cx + (Math.random() - 0.5) * 30,
          y: baseY - 100 - Math.random() * 30,
          vx: (Math.random() - 0.5) * 0.3,
          vy: -0.3 - Math.random() * 0.5,
          size: 8 + Math.random() * 15,
          alpha: 0.08 + Math.random() * 0.06,
          life: 0,
          maxLife: 200 + Math.random() * 150,
          color: `rgba(120, 110, 100,`,
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.01 + Math.random() * 0.02,
        });
      }

      for (let i = smoke.length - 1; i >= 0; i--) {
        const s = smoke[i];
        s.life++;
        s.wobble += s.wobbleSpeed;
        s.x += s.vx + Math.sin(s.wobble) * 0.5;
        s.y += s.vy;
        s.vy *= 0.998;
        s.size += 0.15;
        s.alpha = Math.max(0, s.alpha * (1 - s.life / s.maxLife));

        if (s.life >= s.maxLife || s.alpha < 0.005) {
          smoke.splice(i, 1);
          continue;
        }

        const smokeGrad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size);
        smokeGrad.addColorStop(0, `${s.color}${s.alpha})`);
        smokeGrad.addColorStop(0.6, `${s.color}${s.alpha * 0.3})`);
        smokeGrad.addColorStop(1, "transparent");
        ctx.fillStyle = smokeGrad;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // ---- EMBERS ----
      const embers = embersRef.current;
      if (embers.length < 50 && Math.random() > 0.6) {
        const emberColors = [
          "rgba(255, 200, 50,",
          "rgba(245, 158, 11,",
          "rgba(255, 120, 20,",
          "rgba(239, 68, 68,",
        ];
        embers.push({
          x: cx + (Math.random() - 0.5) * 50,
          y: baseY - 20 + Math.random() * 15,
          vx: (Math.random() - 0.5) * 1.2,
          vy: -0.8 - Math.random() * 2,
          size: 1 + Math.random() * 3,
          alpha: 0.7 + Math.random() * 0.3,
          life: 0,
          maxLife: 60 + Math.random() * 100,
          color: emberColors[Math.floor(Math.random() * emberColors.length)],
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.03 + Math.random() * 0.05,
        });
      }

      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i];
        e.life++;
        e.wobble += e.wobbleSpeed;
        e.x += e.vx + Math.sin(e.wobble) * 0.4;
        e.y += e.vy;
        e.vy *= 0.995;
        e.vx *= 0.99;
        e.alpha = Math.max(0, e.alpha * (1 - e.life / e.maxLife));
        e.size *= 0.997;

        if (e.life >= e.maxLife || e.alpha < 0.01) {
          embers.splice(i, 1);
          continue;
        }

        // Ember glow
        const emberGrad = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.size * 4);
        emberGrad.addColorStop(0, `${e.color}${e.alpha})`);
        emberGrad.addColorStop(0.4, `${e.color}${e.alpha * 0.4})`);
        emberGrad.addColorStop(1, "transparent");
        ctx.fillStyle = emberGrad;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size * 4, 0, Math.PI * 2);
        ctx.fill();

        // Bright core
        ctx.fillStyle = `rgba(255, 255, 200, ${e.alpha * 0.9})`;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // ---- SPARKS (fast flying bits) ----
      const sparks = sparksRef.current;
      if (sparks.length < 15 && Math.random() > 0.92) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.2;
        const speed = 2 + Math.random() * 4;
        sparks.push({
          x: cx + (Math.random() - 0.5) * 20,
          y: baseY - 30,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 0.5 + Math.random() * 1.5,
          alpha: 1,
          life: 0,
          maxLife: 30 + Math.random() * 40,
          color: "rgba(255, 230, 100,",
          wobble: 0,
          wobbleSpeed: 0,
        });
      }

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.life++;
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.05; // gravity
        s.vx *= 0.98;
        s.alpha = Math.max(0, 1 - s.life / s.maxLife);

        if (s.life >= s.maxLife) {
          sparks.splice(i, 1);
          continue;
        }

        // Spark trail
        ctx.strokeStyle = `${s.color}${s.alpha * 0.3})`;
        ctx.lineWidth = s.size * 0.5;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * 3, s.y - s.vy * 3);
        ctx.stroke();

        // Spark point
        ctx.fillStyle = `${s.color}${s.alpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // ---- HEAT SHIMMER (subtle vertical distortion lines above fire) ----
      ctx.globalCompositeOperation = "screen";
      for (let i = 0; i < 5; i++) {
        const shimX = cx + (Math.random() - 0.5) * 60;
        const shimY = baseY - 120 - Math.random() * 80;
        const shimH = 20 + Math.random() * 30;
        const shimAlpha = 0.015 + 0.01 * Math.sin(time * 3 + i);
        const shimGrad = ctx.createLinearGradient(shimX, shimY, shimX, shimY - shimH);
        shimGrad.addColorStop(0, `rgba(255, 200, 100, ${shimAlpha})`);
        shimGrad.addColorStop(0.5, `rgba(255, 180, 80, ${shimAlpha * 0.5})`);
        shimGrad.addColorStop(1, "transparent");
        ctx.fillStyle = shimGrad;
        ctx.fillRect(shimX - 1, shimY - shimH, 2, shimH);
      }
      ctx.globalCompositeOperation = "source-over";

      // ---- SITTING POSITIONS (subtle ground markers) ----
      const positions = [
        { x: cx - 120, y: h * 0.75 },
        { x: cx + 120, y: h * 0.75 },
        { x: cx - 80, y: h * 0.8 },
        { x: cx + 80, y: h * 0.8 },
        { x: cx - 160, y: h * 0.72 },
        { x: cx + 160, y: h * 0.72 },
        { x: cx - 40, y: h * 0.82 },
        { x: cx + 40, y: h * 0.82 },
        { x: cx, y: h * 0.85 },
        { x: cx, y: h * 0.7 },
      ];

      positions.forEach((pos) => {
        const dist = Math.sqrt((pos.x - cx) ** 2 + (pos.y - baseY) ** 2);
        const lightFalloff = Math.max(0, 1 - dist / 300);
        if (lightFalloff > 0.05) {
          const glowGrad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 25);
          glowGrad.addColorStop(0, `rgba(245, 158, 11, ${0.06 * lightFalloff})`);
          glowGrad.addColorStop(1, "transparent");
          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 25, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [initScene]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0"
      style={{ zIndex: 0 }}
    />
  );
}
