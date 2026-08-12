"use client";

import { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/lib/useIsMobile";

interface ArtisticBackgroundProps {
  variant?: "default" | "warm" | "cool" | "cosmic";
}

export default function ArtisticBackground({ variant = "default" }: ArtisticBackgroundProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  const particles = useMemo(() => {
    const count = isMobile ? 30 : 60;
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: `${(i * 17 + 7) % 100}%`,
      size: 1 + (i % 6) * 0.6,
      duration: 8 + (i * 3) % 18,
      delay: (i * 0.5) % 7,
      color: [
        "rgba(13, 148, 136, 0.8)",
        "rgba(6, 182, 212, 0.7)",
        "rgba(16, 185, 129, 0.6)",
        "rgba(96, 165, 250, 0.7)",
        "rgba(34, 211, 238, 0.6)",
        "rgba(167, 139, 250, 0.5)",
        "rgba(251, 146, 60, 0.4)",
      ][i % 7],
    }));
  }, []);

  const constellations = useMemo(() => {
    const pointCount = isMobile ? 12 : 22;
    const points = Array.from({ length: pointCount }).map((_, i) => ({
      x: 5 + (i * 37) % 90,
      y: 5 + (i * 51) % 90,
    }));
    const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let i = 0; i < points.length; i++) {
      const next = (i + 1) % points.length;
      const skip = (i + 2) % points.length;
      if (i % 3 !== 0) {
        lines.push({ x1: points[i].x, y1: points[i].y, x2: points[next].x, y2: points[next].y });
      }
      if (i % 5 === 0) {
        lines.push({ x1: points[i].x, y1: points[i].y, x2: points[skip].x, y2: points[skip].y });
      }
    }
    return { points, lines };
  }, []);

  const orbColors = variant === "warm"
    ? ["rgba(6, 182, 212, 0.25)", "rgba(16, 185, 129, 0.18)", "rgba(251, 146, 60, 0.15)", "rgba(244, 63, 94, 0.1)"]
    : variant === "cool"
    ? ["rgba(96, 165, 250, 0.25)", "rgba(34, 211, 238, 0.18)", "rgba(129, 140, 248, 0.15)", "rgba(139, 92, 246, 0.1)"]
    : variant === "cosmic"
    ? ["rgba(13, 148, 136, 0.25)", "rgba(6, 182, 212, 0.18)", "rgba(16, 185, 129, 0.12)", "rgba(167, 139, 250, 0.1)"]
    : ["rgba(13, 148, 136, 0.18)", "rgba(6, 182, 212, 0.12)", "rgba(16, 185, 129, 0.1)", "rgba(96, 165, 250, 0.08)"];

  return (
    <>
      {/* Cosmic background gradients */}
      <div className="page-cosmic-bg" />

      {/* Animated nebula wash */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          className="absolute w-[900px] h-[900px] rounded-full"
          style={{
            top: "-22%",
            right: "-18%",
            background: `radial-gradient(circle, ${orbColors[0]}, ${orbColors[1]} 40%, transparent 60%)`,
            filter: "blur(85px)",
            opacity: "var(--orb-opacity, 0.12)",
          }}
          animate={{
            x: [0, 55, -35, 25, 0],
            y: [0, -35, 55, -25, 0],
          }}
          transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[700px] h-[700px] rounded-full"
          style={{
            bottom: "-18%",
            left: "-12%",
            background: `radial-gradient(circle, ${orbColors[1]}, ${orbColors[2]} 40%, transparent 60%)`,
            filter: "blur(75px)",
            opacity: "var(--orb-opacity, 0.1)",
          }}
          animate={{
            x: [0, -45, 30, -20, 0],
            y: [0, 35, -45, 25, 0],
          }}
          transition={{ duration: 40, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[550px] h-[550px] rounded-full"
          style={{
            top: "40%",
            left: "28%",
            background: `radial-gradient(circle, ${orbColors[2]}, ${orbColors[3]} 40%, transparent 60%)`,
            filter: "blur(65px)",
            opacity: "var(--orb-opacity, 0.06)",
          }}
          animate={{
            x: [0, 35, -25, 18, 0],
            y: [0, -25, 35, -18, 0],
          }}
          transition={{ duration: 45, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Floating energy orbs */}
        <motion.div
          className="absolute w-[180px] h-[180px] rounded-full"
          style={{
            top: "18%",
            left: "58%",
            background: "radial-gradient(circle, rgba(96, 165, 250, 0.12) 0%, rgba(59, 130, 246, 0.05) 50%, transparent 60%)",
            filter: "blur(30px)",
            opacity: "var(--orb-opacity, 0.04)",
          }}
          animate={{
            x: [0, 90, -70, 50, 0],
            y: [0, -70, 90, -50, 0],
          }}
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[200px] h-[200px] rounded-full"
          style={{
            bottom: "22%",
            right: "18%",
            background: "radial-gradient(circle, rgba(34, 211, 238, 0.1) 0%, rgba(16, 185, 129, 0.04) 50%, transparent 60%)",
            filter: "blur(35px)",
            opacity: "var(--orb-opacity, 0.03)",
          }}
          animate={{
            x: [0, -80, 60, -40, 0],
            y: [0, 60, -80, 40, 0],
          }}
          transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[140px] h-[140px] rounded-full"
          style={{
            top: "60%",
            right: "40%",
            background: "radial-gradient(circle, rgba(167, 139, 250, 0.08) 0%, transparent 60%)",
            filter: "blur(25px)",
            opacity: "var(--orb-opacity, 0.03)",
          }}
          animate={{
            x: [0, 50, -40, 30, 0],
            y: [0, -40, 50, -30, 0],
          }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        />
      </div>

      {/* Constellation lines with animation */}
      <svg className="fixed inset-0 w-full h-full pointer-events-none z-[1]">
        {constellations.lines.map((line, i) => (
          <motion.line
            key={i}
            x1={`${line.x1}%`}
            y1={`${line.y1}%`}
            x2={`${line.x2}%`}
            y2={`${line.y2}%`}
            stroke={i % 3 === 0 ? "rgba(6, 182, 212, 0.3)" : i % 3 === 1 ? "rgba(96, 165, 250, 0.25)" : "rgba(13, 148, 136, 0.28)"}
            strokeWidth="0.5"
            strokeDasharray={i % 4 === 0 ? "2 8" : "4 6"}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.08, 0.45, 0.08] }}
            transition={{ duration: 3 + i * 0.25, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }}
            style={{ opacity: "var(--constellation-opacity, 0.25)" }}
          />
        ))}
        {constellations.points.map((point, i) => (
          <motion.circle
            key={i}
            cx={`${point.x}%`}
            cy={`${point.y}%`}
            r="2"
            fill={i % 4 === 0 ? "rgba(6, 182, 212, 0.6)" : i % 4 === 1 ? "rgba(96, 165, 250, 0.5)" : i % 4 === 2 ? "rgba(16, 185, 129, 0.5)" : "rgba(167, 139, 250, 0.45)"}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.15, 0.75, 0.15], r: [1.2, 2.8, 1.2] }}
            transition={{ duration: 2 + i * 0.2, repeat: Infinity, ease: "easeInOut", delay: i * 0.12 }}
            style={{ opacity: "var(--constellation-opacity, 0.25)" }}
          />
        ))}
      </svg>

      {/* Floating particles */}
      <div className="cosmic-particles" style={{ opacity: "var(--particle-opacity, 0.7)" }}>
        {particles.map((p) => (
          <div
            key={p.id}
            className="cosmic-particle"
            style={{
              left: p.left,
              bottom: "-5%",
              width: p.size,
              height: p.size,
              background: p.color,
              boxShadow: `0 0 ${p.size * 5}px ${p.color}`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Energy waves */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-[1]"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(13, 148, 136, 0.05), rgba(6, 182, 212, 0.03), transparent)",
          opacity: "var(--glow-opacity, 0.5)",
        }}
        animate={{
          x: ["-50%", "150%"],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="fixed inset-0 pointer-events-none z-[1]"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(96, 165, 250, 0.04), rgba(167, 139, 250, 0.02), transparent)",
          opacity: "var(--glow-opacity, 0.4)",
        }}
        animate={{
          x: ["150%", "-50%"],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear", delay: 5 }}
      />
      <motion.div
        className="fixed inset-0 pointer-events-none z-[1]"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.03), rgba(34, 211, 238, 0.02), transparent)",
          opacity: "var(--glow-opacity, 0.3)",
        }}
        animate={{
          x: ["-30%", "130%"],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear", delay: 10 }}
      />

      {/* Mouse-following glow — hidden on mobile */}
      {!isMobile && (
        <motion.div
          className="fixed pointer-events-none z-[2] w-[500px] h-[500px] rounded-full"
          style={{
            left: mousePos.x - 250,
            top: mousePos.y - 250,
            background: "radial-gradient(circle, rgba(13, 148, 136, 0.07), rgba(6, 182, 212, 0.03) 40%, transparent 70%)",
            filter: "blur(45px)",
            transition: "left 0.3s ease-out, top 0.3s ease-out",
            opacity: "var(--glow-opacity, 0.06)",
          }}
        />
      )}

      {/* Corner flourishes */}
      <div className="corner-flourish corner-flourish--tl" />
      <div className="corner-flourish corner-flourish--tr" />
      <div className="corner-flourish corner-flourish--bl" />
      <div className="corner-flourish corner-flourish--br" />
    </>
  );
}
