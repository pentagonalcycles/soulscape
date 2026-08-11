"use client";

import { useRef, useEffect, useCallback } from "react";

interface CampfireSceneProps {
  isPlaying: boolean;
}

interface Ember {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

interface Flame {
  x: number;
  baseY: number;
  width: number;
  height: number;
  phase: number;
  speed: number;
  color: string;
}

export default function CampfireScene({ isPlaying }: CampfireSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const embersRef = useRef<Ember[]>([]);
  const flamesRef = useRef<Flame[]>([]);
  const logsRef = useRef<{ x: number; y: number; w: number; h: number; angle: number }[]>([]);

  const initScene = useCallback((w: number, h: number) => {
    // Initialize flames
    const flameColors = [
      "rgba(251, 191, 36, 0.9)",   // bright yellow
      "rgba(245, 158, 11, 0.85)",  // amber
      "rgba(249, 115, 22, 0.8)",   // orange
      "rgba(239, 68, 68, 0.7)",    // red
      "rgba(220, 38, 38, 0.6)",    // dark red
    ];

    const flames: Flame[] = [];
    for (let i = 0; i < 7; i++) {
      flames.push({
        x: w / 2 + (Math.random() - 0.5) * 40,
        baseY: h * 0.65,
        width: 20 + Math.random() * 30,
        height: 60 + Math.random() * 80,
        phase: Math.random() * Math.PI * 2,
        speed: 0.02 + Math.random() * 0.03,
        color: flameColors[Math.floor(Math.random() * flameColors.length)],
      });
    }
    flamesRef.current = flames;

    // Initialize logs
    logsRef.current = [
      { x: w / 2 - 30, y: h * 0.68, w: 60, h: 12, angle: -0.2 },
      { x: w / 2 + 20, y: h * 0.69, w: 55, h: 10, angle: 0.3 },
      { x: w / 2 - 10, y: h * 0.70, w: 50, h: 11, angle: 0.1 },
    ];

    // Initialize embers
    embersRef.current = [];
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
      const time = Date.now() / 1000;

      // Clear
      ctx.clearRect(0, 0, w, h);

      // Ground glow
      const groundGlow = ctx.createRadialGradient(w / 2, h * 0.7, 0, w / 2, h * 0.7, 300);
      groundGlow.addColorStop(0, "rgba(245, 158, 11, 0.15)");
      groundGlow.addColorStop(0.5, "rgba(245, 158, 11, 0.05)");
      groundGlow.addColorStop(1, "transparent");
      ctx.fillStyle = groundGlow;
      ctx.fillRect(0, 0, w, h);

      // Draw logs
      logsRef.current.forEach((log) => {
        ctx.save();
        ctx.translate(log.x + log.w / 2, log.y + log.h / 2);
        ctx.rotate(log.angle);

        // Log body
        const logGrad = ctx.createLinearGradient(-log.w / 2, -log.h / 2, -log.w / 2, log.h / 2);
        logGrad.addColorStop(0, "#4a3728");
        logGrad.addColorStop(0.5, "#3d2b1a");
        logGrad.addColorStop(1, "#2d1f12");
        ctx.fillStyle = logGrad;
        ctx.beginPath();
        ctx.roundRect(-log.w / 2, -log.h / 2, log.w, log.h, 4);
        ctx.fill();

        // Ember glow on logs
        ctx.fillStyle = `rgba(245, 158, 11, ${0.1 + 0.05 * Math.sin(time * 2)})`;
        ctx.beginPath();
        ctx.roundRect(-log.w / 2, -log.h / 2, log.w, log.h * 0.3, 4);
        ctx.fill();

        ctx.restore();
      });

      // Draw flames
      flamesRef.current.forEach((flame) => {
        flame.phase += flame.speed;
        const flicker = Math.sin(flame.phase) * 0.3 + Math.sin(flame.phase * 2.3) * 0.15;
        const currentHeight = flame.height * (0.7 + flicker * 0.3);
        const currentWidth = flame.width * (0.8 + Math.sin(flame.phase * 1.5) * 0.2);

        // Flame shape
        ctx.save();
        ctx.translate(flame.x, flame.baseY);

        const flameGrad = ctx.createLinearGradient(0, 0, 0, -currentHeight);
        flameGrad.addColorStop(0, "rgba(251, 191, 36, 0.9)");
        flameGrad.addColorStop(0.3, flame.color);
        flameGrad.addColorStop(0.7, "rgba(239, 68, 68, 0.5)");
        flameGrad.addColorStop(1, "transparent");

        ctx.fillStyle = flameGrad;
        ctx.beginPath();
        ctx.moveTo(-currentWidth / 2, 0);
        ctx.quadraticCurveTo(
          -currentWidth / 3 + Math.sin(time * 3 + flame.phase) * 5,
          -currentHeight * 0.4,
          Math.sin(time * 2.5 + flame.phase) * 8,
          -currentHeight
        );
        ctx.quadraticCurveTo(
          currentWidth / 3 + Math.sin(time * 3.5 + flame.phase) * 5,
          -currentHeight * 0.4,
          currentWidth / 2,
          0
        );
        ctx.closePath();
        ctx.fill();

        // Inner bright core
        const coreGrad = ctx.createLinearGradient(0, 0, 0, -currentHeight * 0.5);
        coreGrad.addColorStop(0, "rgba(255, 255, 200, 0.8)");
        coreGrad.addColorStop(1, "transparent");
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.ellipse(0, -currentHeight * 0.2, currentWidth * 0.25, currentHeight * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      // Draw fire glow
      const fireGlow = ctx.createRadialGradient(w / 2, h * 0.6, 0, w / 2, h * 0.6, 200);
      fireGlow.addColorStop(0, `rgba(255, 200, 50, ${0.2 + 0.05 * Math.sin(time * 3)})`);
      fireGlow.addColorStop(0.5, `rgba(255, 150, 50, ${0.08 + 0.03 * Math.sin(time * 2.5)})`);
      fireGlow.addColorStop(1, "transparent");
      ctx.fillStyle = fireGlow;
      ctx.fillRect(0, 0, w, h);

      // Update and draw embers
      const embers = embersRef.current;

      // Spawn new embers
      if (embers.length < 40 && Math.random() > 0.7) {
        embers.push({
          x: w / 2 + (Math.random() - 0.5) * 60,
          y: h * 0.6 + Math.random() * 20,
          vx: (Math.random() - 0.5) * 0.8,
          vy: -0.5 - Math.random() * 1.5,
          size: 1 + Math.random() * 2.5,
          alpha: 0.6 + Math.random() * 0.4,
          life: 0,
          maxLife: 80 + Math.random() * 120,
        });
      }

      // Update embers
      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i];
        e.life++;
        e.x += e.vx + Math.sin(time * 2 + i) * 0.3;
        e.y += e.vy;
        e.vy *= 0.99;
        e.alpha = Math.max(0, e.alpha * (1 - e.life / e.maxLife));
        e.size *= 0.998;

        if (e.life >= e.maxLife || e.alpha < 0.01) {
          embers.splice(i, 1);
          continue;
        }

        // Draw ember
        const emberGrad = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.size * 3);
        emberGrad.addColorStop(0, `rgba(255, 200, 50, ${e.alpha})`);
        emberGrad.addColorStop(0.5, `rgba(245, 158, 11, ${e.alpha * 0.5})`);
        emberGrad.addColorStop(1, "transparent");
        ctx.fillStyle = emberGrad;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size * 3, 0, Math.PI * 2);
        ctx.fill();

        // Bright core
        ctx.fillStyle = `rgba(255, 255, 200, ${e.alpha * 0.8})`;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw sitting positions (presence dots)
      const positions = [
        { x: w / 2 - 120, y: h * 0.75 },
        { x: w / 2 + 120, y: h * 0.75 },
        { x: w / 2 - 80, y: h * 0.8 },
        { x: w / 2 + 80, y: h * 0.8 },
        { x: w / 2 - 160, y: h * 0.72 },
        { x: w / 2 + 160, y: h * 0.72 },
        { x: w / 2 - 40, y: h * 0.82 },
        { x: w / 2 + 40, y: h * 0.82 },
        { x: w / 2, y: h * 0.85 },
        { x: w / 2, y: h * 0.7 },
      ];

      // Store positions for external access
      (canvas as any)._sittingPositions = positions;

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
