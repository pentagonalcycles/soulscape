"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { CATEGORIES } from "@/lib/soul-map/questions";

interface Answer {
  id: string;
  question: string;
  answer: string;
  category: string;
  timestamp: number;
}

interface SoulMapVisualProps {
  answers: Answer[];
  onSelectAnswer: (answer: Answer) => void;
}

export default function SoulMapVisual({ answers, onSelectAnswer }: SoulMapVisualProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const timeRef = useRef(0);
  const ringsRef = useRef<{
    answer: Answer;
    radius: number;
    color: string;
    glow: string;
    pattern: number;
    rotation: number;
  }[]>([]);

  // Build ring data from answers
  useEffect(() => {
    const rings = answers.map((answer, i) => {
      const cat = CATEGORIES[answer.category] || CATEGORIES.emotions;
      return {
        answer,
        radius: 60 + i * 25,
        color: cat.color,
        glow: cat.glow,
        pattern: i % 5,
        rotation: (i * 137.5 * Math.PI) / 180, // golden angle
      };
    });
    ringsRef.current = rings;
  }, [answers]);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      timeRef.current += 0.01;
      const time = timeRef.current;

      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.translate(w / 2 + pan.x, h / 2 + pan.y);
      ctx.scale(zoom, zoom);

      // Breathing pulse
      const breathe = 1 + Math.sin(time * 0.5) * 0.02;

      // Draw center dot if no answers
      if (ringsRef.current.length === 0) {
        const pulse = 1 + Math.sin(time * 2) * 0.3;
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 8 * pulse);
        grad.addColorStop(0, "rgba(245, 158, 11, 0.4)");
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, 8 * pulse, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw rings
      ringsRef.current.forEach((ring, i) => {
        const r = ring.radius * breathe;
        const phase = time * 0.3 + ring.rotation;

        ctx.save();
        ctx.rotate(phase * (i % 2 === 0 ? 1 : -1) * 0.1);

        // Outer glow
        const glowGrad = ctx.createRadialGradient(0, 0, r - 15, 0, 0, r + 15);
        glowGrad.addColorStop(0, "transparent");
        glowGrad.addColorStop(0.5, ring.glow);
        glowGrad.addColorStop(1, "transparent");
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(0, 0, r + 15, 0, Math.PI * 2);
        ctx.arc(0, 0, r - 15, 0, Math.PI * 2, true);
        ctx.fill();

        // Draw pattern based on type
        ctx.strokeStyle = ring.color;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.7;

        switch (ring.pattern) {
          case 0: // Dotted ring
            for (let a = 0; a < Math.PI * 2; a += 0.2) {
              const x = Math.cos(a) * r;
              const y = Math.sin(a) * r;
              ctx.beginPath();
              ctx.arc(x, y, 2, 0, Math.PI * 2);
              ctx.fillStyle = ring.color;
              ctx.globalAlpha = 0.5 + 0.3 * Math.sin(a * 5 + time);
              ctx.fill();
            }
            break;

          case 1: // Wave ring
            ctx.beginPath();
            for (let a = 0; a <= Math.PI * 2; a += 0.05) {
              const wave = Math.sin(a * 8 + time * 2) * 5;
              const x = Math.cos(a) * (r + wave);
              const y = Math.sin(a) * (r + wave);
              if (a === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.stroke();
            break;

          case 2: // Petal ring
            for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
              const px = Math.cos(a) * r;
              const py = Math.sin(a) * r;
              const petalSize = 8 + Math.sin(time + a) * 2;
              ctx.beginPath();
              ctx.ellipse(px, py, petalSize, petalSize * 0.5, a, 0, Math.PI * 2);
              ctx.globalAlpha = 0.3;
              ctx.fillStyle = ring.color;
              ctx.fill();
              ctx.globalAlpha = 0.6;
              ctx.stroke();
            }
            break;

          case 3: // Star ring
            for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
              const x = Math.cos(a) * r;
              const y = Math.sin(a) * r;
              const size = 4 + Math.sin(time * 2 + a * 3) * 1.5;
              ctx.beginPath();
              for (let j = 0; j < 6; j++) {
                const sa = (j * Math.PI) / 3;
                const sr = j % 2 === 0 ? size : size * 0.4;
                const sx = x + Math.cos(sa) * sr;
                const sy = y + Math.sin(sa) * sr;
                if (j === 0) ctx.moveTo(sx, sy);
                else ctx.lineTo(sx, sy);
              }
              ctx.closePath();
              ctx.globalAlpha = 0.4;
              ctx.fillStyle = ring.color;
              ctx.fill();
            }
            break;

          case 4: // Double ring with connectors
            ctx.beginPath();
            ctx.arc(0, 0, r - 3, 0, Math.PI * 2);
            ctx.globalAlpha = 0.3;
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(0, 0, r + 3, 0, Math.PI * 2);
            ctx.globalAlpha = 0.5;
            ctx.stroke();
            for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
              ctx.beginPath();
              ctx.moveTo(Math.cos(a) * (r - 3), Math.sin(a) * (r - 3));
              ctx.lineTo(Math.cos(a) * (r + 3), Math.sin(a) * (r + 3));
              ctx.globalAlpha = 0.4;
              ctx.stroke();
            }
            break;
        }

        ctx.restore();
      });

      // Draw connecting lines between rings
      if (ringsRef.current.length > 1) {
        ctx.globalAlpha = 0.05;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = 0.5;
        for (let i = 0; i < ringsRef.current.length - 1; i++) {
          const r1 = ringsRef.current[i].radius * breathe;
          const r2 = ringsRef.current[i + 1].radius * breathe;
          for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1);
            ctx.lineTo(Math.cos(a) * r2, Math.sin(a) * r2);
            ctx.stroke();
          }
        }
      }

      ctx.restore();
      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [zoom, pan]);

  // Mouse/touch handlers for panning
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsPanning(true);
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return;
    const dx = e.clientX - lastMouseRef.current.x;
    const dy = e.clientY - lastMouseRef.current.y;
    setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  }, [isPanning]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Zoom with scroll
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((prev) => Math.max(0.3, Math.min(3, prev * delta)));
  }, []);

  // Click to select ring
  const handleClick = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left - canvas.width / 2 - pan.x) / zoom;
    const my = (e.clientY - rect.top - canvas.height / 2 - pan.y) / zoom;
    const dist = Math.sqrt(mx * mx + my * my);

    // Find closest ring
    let closest: Answer | null = null;
    let closestDist = Infinity;
    const breathe = 1 + Math.sin(timeRef.current * 0.5) * 0.02;

    ringsRef.current.forEach((ring) => {
      const r = ring.radius * breathe;
      const d = Math.abs(dist - r);
      if (d < 15 && d < closestDist) {
        closestDist = d;
        closest = ring.answer;
      }
    });

    if (closest) {
      onSelectAnswer(closest);
    }
  }, [zoom, pan, onSelectAnswer]);

  // Touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsPanning(true);
      lastMouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPanning || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - lastMouseRef.current.x;
    const dy = e.touches[0].clientY - lastMouseRef.current.y;
    setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    lastMouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, [isPanning]);

  const handleTouchEnd = useCallback(() => {
    setIsPanning(false);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0"
      style={{ cursor: isPanning ? "grabbing" : "grab", touchAction: "none" }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleClick}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    />
  );
}
