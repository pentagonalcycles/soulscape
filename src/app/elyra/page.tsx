"use client";

import { useAuth } from "@/components/AuthProvider";
import ElyraChat from "@/components/ElyraChat";
import Link from "next/link";
import { useRef, useEffect } from "react";

function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    // Particles
    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number; pulse: number; pulseSpeed: number }[] = [];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: 0.5 + Math.random() * 2,
        alpha: 0.1 + Math.random() * 0.4,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.04,
      });
    }

    // Data streams
    const streams: { x: number; y: number; speed: number; chars: string[]; opacity: number; hue: number }[] = [];
    const chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノ".split("");
    for (let i = 0; i < 20; i++) {
      const streamChars: string[] = [];
      for (let j = 0; j < 12; j++) {
        streamChars.push(chars[Math.floor(Math.random() * chars.length)]);
      }
      streams.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: 0.3 + Math.random() * 2,
        chars: streamChars,
        opacity: 0.02 + Math.random() * 0.06,
        hue: Math.random() > 0.7 ? 270 : 180, // cyan or purple
      });
    }

    // Energy pulses
    const pulses: { x: number; y: number; radius: number; maxRadius: number; speed: number; alpha: number }[] = [];

    let animId: number;
    let frame = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;

      // Draw hex grid
      const hexSize = 30;
      const hexHeight = hexSize * Math.sqrt(3);
      ctx.strokeStyle = "rgba(6, 182, 212, 0.015)";
      ctx.lineWidth = 0.5;
      for (let row = -1; row < canvas.height / hexHeight + 1; row++) {
        for (let col = -1; col < canvas.width / (hexSize * 1.5) + 1; col++) {
          const x = col * hexSize * 1.5;
          const y = row * hexHeight + (col % 2 === 0 ? 0 : hexHeight / 2);
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 6;
            const hx = x + hexSize * Math.cos(angle);
            const hy = y + hexSize * Math.sin(angle);
            if (i === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }

      // Draw data streams
      streams.forEach(s => {
        s.y += s.speed;
        if (s.y > canvas.height + 150) {
          s.y = -150;
          s.x = Math.random() * canvas.width;
        }
        ctx.font = "11px monospace";
        s.chars.forEach((char, i) => {
          const charY = s.y + i * 16;
          if (charY > 0 && charY < canvas.height) {
            const brightness = i === 0 ? 4 : i === 1 ? 2 : 1;
            if (s.hue === 270) {
              ctx.fillStyle = `rgba(139, 92, 246, ${s.opacity * brightness})`;
            } else {
              ctx.fillStyle = `rgba(6, 182, 212, ${s.opacity * brightness})`;
            }
            ctx.fillText(char, s.x, charY);
          }
        });
        if (Math.random() > 0.93) {
          const idx = Math.floor(Math.random() * s.chars.length);
          s.chars[idx] = chars[Math.floor(Math.random() * chars.length)];
        }
      });

      // Draw particles with pulsing
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += p.pulseSpeed;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        const pulseAlpha = p.alpha * (0.5 + 0.5 * Math.sin(p.pulse));
        const pulseSize = p.size * (0.8 + 0.2 * Math.sin(p.pulse));

        // Glow
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, pulseSize * 4);
        grad.addColorStop(0, `rgba(6, 182, 212, ${pulseAlpha})`);
        grad.addColorStop(0.5, `rgba(6, 182, 212, ${pulseAlpha * 0.3})`);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, pulseSize * 4, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = `rgba(103, 232, 249, ${pulseAlpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, pulseSize, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw connections
      ctx.lineWidth = 0.3;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const alpha = 0.08 * (1 - dist / 120);
            ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Energy pulses
      if (frame % 120 === 0) {
        pulses.push({
          x: canvas.width / 2 + (Math.random() - 0.5) * 200,
          y: canvas.height / 2 + (Math.random() - 0.5) * 200,
          radius: 0,
          maxRadius: 200 + Math.random() * 200,
          speed: 1 + Math.random() * 2,
          alpha: 0.1 + Math.random() * 0.1,
        });
      }

      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.radius += p.speed;
        const progress = p.radius / p.maxRadius;
        const currentAlpha = p.alpha * (1 - progress);

        if (currentAlpha < 0.001) {
          pulses.splice(i, 1);
          continue;
        }

        ctx.strokeStyle = `rgba(6, 182, 212, ${currentAlpha})`;
        ctx.lineWidth = 1.5 * (1 - progress);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Center glow
      const centerGlow = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, 300
      );
      centerGlow.addColorStop(0, "rgba(6, 182, 212, 0.03)");
      centerGlow.addColorStop(0.5, "rgba(139, 92, 246, 0.01)");
      centerGlow.addColorStop(1, "transparent");
      ctx.fillStyle = centerGlow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />;
}

function ElyraIcon({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <linearGradient id="iconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <g filter="url(#glow)">
        <path d="M24 6 L30 18 L42 18 L32 26 L36 38 L24 30 L12 38 L16 26 L6 18 L18 18 Z" stroke="url(#iconGrad)" strokeWidth="1.5" fill="none" opacity="0.9" />
        <circle cx="24" cy="6" r="2.5" fill="#06b6d4" />
        <circle cx="42" cy="18" r="2.5" fill="#22d3ee" />
        <circle cx="36" cy="38" r="2.5" fill="#a78bfa" />
        <circle cx="12" cy="38" r="2.5" fill="#a78bfa" />
        <circle cx="6" cy="18" r="2.5" fill="#06b6d4" />
        <circle cx="24" cy="24" r="4" fill="#67e8f9">
          <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
        </circle>
        <line x1="24" y1="8.5" x2="24" y2="21" stroke="#06b6d4" strokeWidth="1.5" opacity="0.8" />
        <line x1="40" y1="18" x2="27" y2="24" stroke="#22d3ee" strokeWidth="1.5" opacity="0.6" />
        <line x1="34" y1="36" x2="26" y2="26" stroke="#a78bfa" strokeWidth="1.5" opacity="0.6" />
        <line x1="14" y1="36" x2="22" y2="26" stroke="#a78bfa" strokeWidth="1.5" opacity="0.6" />
        <line x1="8" y1="18" x2="21" y2="24" stroke="#06b6d4" strokeWidth="1.5" opacity="0.6" />
      </g>
    </svg>
  );
}

export default function ElyraPage() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        position: "fixed", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "#020617",
        overflow: "hidden",
      }}>
        {/* Background grid */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `
            linear-gradient(rgba(6, 182, 212, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6, 182, 212, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }} />

        <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
          <div style={{
            margin: "0 auto 24px",
            animation: "breathe 3s ease-in-out infinite",
            position: "relative",
          }}>
            {/* Orbiting elements */}
            <div style={{
              position: "absolute", inset: "-30px",
              border: "1px solid rgba(6, 182, 212, 0.1)",
              borderRadius: "50%",
              animation: "orbit 4s linear infinite",
            }}>
              <div style={{
                position: "absolute", top: "0", left: "50%",
                width: "6px", height: "6px", borderRadius: "50%",
                background: "#06b6d4",
                boxShadow: "0 0 15px rgba(6, 182, 212, 1), 0 0 30px rgba(6, 182, 212, 0.5)",
                transform: "translate(-50%, -50%)",
              }} />
            </div>
            <div style={{
              position: "absolute", inset: "-20px",
              border: "1px solid rgba(139, 92, 246, 0.08)",
              borderRadius: "50%",
              animation: "orbit 3s linear infinite reverse",
            }}>
              <div style={{
                position: "absolute", bottom: "0", right: "0",
                width: "4px", height: "4px", borderRadius: "50%",
                background: "#8b5cf6",
                boxShadow: "0 0 12px rgba(139, 92, 246, 0.8)",
                transform: "translate(50%, 50%)",
              }} />
            </div>
            <ElyraIcon size={64} />
          </div>

          <div style={{ position: "relative" }}>
            <p style={{
              color: "#06b6d4", fontSize: "10px",
              letterSpacing: "6px", textTransform: "uppercase",
              fontFamily: "monospace",
            }}>Initializing Neural Interface</p>

            {/* Loading bar */}
            <div style={{
              marginTop: "24px",
              width: "240px", height: "2px",
              background: "rgba(6, 182, 212, 0.08)",
              borderRadius: "1px",
              overflow: "hidden",
              margin: "24px auto 0",
              position: "relative",
            }}>
              <div style={{
                width: "30%", height: "100%",
                background: "linear-gradient(90deg, transparent, #06b6d4, #8b5cf6, transparent)",
                animation: "loading 1.5s ease-in-out infinite",
              }} />
            </div>

            {/* Status text */}
            <div style={{
              marginTop: "16px",
              fontFamily: "monospace",
              fontSize: "8px",
              color: "rgba(6, 182, 212, 0.3)",
              letterSpacing: "2px",
            }}>
              {`{status:loading}{progress:${Math.floor(Math.random() * 100)}%}`}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: "fixed", inset: 0,
      display: "flex", flexDirection: "column",
      background: "#020617",
    }}>
      {/* Animated background */}
      <AnimatedBackground />

      {/* Scanline overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.015) 2px, rgba(0, 0, 0, 0.015) 4px)",
        pointerEvents: "none",
        zIndex: 2,
      }} />

      {/* Vignette */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at center, transparent 50%, rgba(2, 6, 23, 0.8) 100%)",
        pointerEvents: "none",
        zIndex: 3,
      }} />

      {/* Header */}
      <div style={{
        flexShrink: 0, padding: "12px 16px",
        background: "rgba(2, 6, 23, 0.9)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(6, 182, 212, 0.1)",
        display: "flex", alignItems: "center", gap: "12px",
        position: "relative", zIndex: 10,
      }}>
        {/* Corner accents */}
        <div style={{ position: "absolute", top: 0, left: 0, width: "24px", height: "1px", background: "linear-gradient(90deg, #06b6d4, transparent)" }} />
        <div style={{ position: "absolute", top: 0, left: 0, width: "1px", height: "24px", background: "linear-gradient(180deg, #06b6d4, transparent)" }} />
        <div style={{ position: "absolute", top: 0, right: 0, width: "24px", height: "1px", background: "linear-gradient(270deg, #8b5cf6, transparent)" }} />
        <div style={{ position: "absolute", top: 0, right: 0, width: "1px", height: "24px", background: "linear-gradient(180deg, #8b5cf6, transparent)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, width: "24px", height: "1px", background: "linear-gradient(90deg, #8b5cf6, transparent)" }} />
        <div style={{ position: "absolute", bottom: 0, right: 0, width: "24px", height: "1px", background: "linear-gradient(270deg, #06b6d4, transparent)" }} />

        <Link href="/" style={{
          padding: "8px", color: "#06b6d4", textDecoration: "none",
          display: "flex", alignItems: "center", borderRadius: "2px",
          border: "1px solid rgba(6, 182, 212, 0.15)",
          background: "rgba(6, 182, 212, 0.02)",
          transition: "all 0.3s",
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
        </Link>
        <div style={{ position: "relative" }}>
          <ElyraIcon size={32} />
          <div style={{
            position: "absolute", bottom: "-3px", right: "-3px",
            width: "10px", height: "10px", borderRadius: "50%",
            background: "#22c55e", border: "2px solid #020617",
            boxShadow: "0 0 12px rgba(34, 197, 94, 0.8), 0 0 24px rgba(34, 197, 94, 0.4)",
            animation: "pulse 1.5s ease-in-out infinite",
          }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: "15px", fontWeight: 700, color: "#e2e8f0",
            letterSpacing: "8px", textTransform: "uppercase",
            textShadow: "0 0 15px rgba(6, 182, 212, 0.4), 0 0 30px rgba(6, 182, 212, 0.2)",
            background: "linear-gradient(135deg, #06b6d4, #8b5cf6, #06b6d4)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundSize: "200% 100%",
            animation: "gradientShift 3s ease-in-out infinite",
          }}>ELYRA</div>
          <div style={{
            fontSize: "8px", color: "#06b6d4",
            letterSpacing: "3px", textTransform: "uppercase",
            fontFamily: "monospace", opacity: 0.6,
          }}>◈ Neural Interface v3.0.1 ◈</div>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: "8px",
          padding: "4px 10px",
          background: "rgba(34, 197, 94, 0.05)",
          border: "1px solid rgba(34, 197, 94, 0.15)",
          borderRadius: "2px",
        }}>
          <div style={{
            width: "5px", height: "5px", borderRadius: "50%",
            background: "#22c55e",
            boxShadow: "0 0 8px rgba(34, 197, 94, 0.8)",
            animation: "pulse 1.5s ease-in-out infinite",
          }} />
          <span style={{
            fontSize: "8px", color: "#22c55e",
            letterSpacing: "2px", textTransform: "uppercase",
            fontFamily: "monospace",
          }}>Online</span>
        </div>
      </div>

      {/* Chat */}
      <div style={{ flex: 1, minHeight: 0, position: "relative", zIndex: 5 }}>
        <ElyraChat isPlus={true} />
      </div>

      {/* Bottom status bar */}
      <div style={{
        flexShrink: 0,
        padding: "6px 16px",
        background: "rgba(2, 6, 23, 0.95)",
        borderTop: "1px solid rgba(6, 182, 212, 0.06)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        position: "relative", zIndex: 10,
      }}>
        <div style={{ display: "flex", gap: "16px" }}>
          {[
            { label: "SYS", value: "OK", color: "#22c55e" },
            { label: "NET", value: "STABLE", color: "#06b6d4" },
            { label: "ENC", value: "AES-256", color: "#8b5cf6" },
            { label: "PROTO", value: "NEURAL", color: "#06b6d4" },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", gap: "4px", alignItems: "center" }}>
              <span style={{ fontSize: "7px", color: "#1e293b", letterSpacing: "1px", fontFamily: "monospace" }}>{s.label}:</span>
              <span style={{ fontSize: "7px", color: s.color, letterSpacing: "1px", fontFamily: "monospace", opacity: 0.6 }}>{s.value}</span>
            </div>
          ))}
        </div>
        <span style={{ fontSize: "7px", color: "#1e293b", letterSpacing: "1px", fontFamily: "monospace" }}>
          {`lat:${Math.floor(Math.random() * 15 + 8)}ms`}
        </span>
      </div>

      <style>{`
        @keyframes breathe {
          0%, 100% { opacity: 0.8; transform: scale(1); filter: drop-shadow(0 0 25px rgba(6, 182, 212, 0.5)); }
          50% { opacity: 1; transform: scale(1.1); filter: drop-shadow(0 0 50px rgba(6, 182, 212, 0.7)); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        @keyframes orbit {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
}
