"use client";

import { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";

interface ArtisticBackgroundProps {
  variant?: "default" | "warm" | "cool" | "cosmic";
}

export default function ArtisticBackground({ variant = "default" }: ArtisticBackgroundProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  const particles = useMemo(() => {
    return Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      left: `${(i * 23 + 7) % 100}%`,
      size: 1 + (i % 5) * 0.5,
      duration: 10 + (i * 3) % 15,
      delay: (i * 0.6) % 6,
      color: [
        "rgba(13, 148, 136, 0.7)",
        "rgba(6, 182, 212, 0.6)",
        "rgba(16, 185, 129, 0.5)",
        "rgba(96, 165, 250, 0.6)",
        "rgba(34, 211, 238, 0.5)",
      ][i % 5],
    }));
  }, []);

  const constellations = useMemo(() => {
    const points = Array.from({ length: 15 }).map((_, i) => ({
      x: 8 + (i * 43) % 84,
      y: 8 + (i * 57) % 84,
    }));
    const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let i = 0; i < points.length; i++) {
      const next = (i + 1) % points.length;
      if (i % 3 !== 0) {
        lines.push({ x1: points[i].x, y1: points[i].y, x2: points[next].x, y2: points[next].y });
      }
    }
    return { points, lines };
  }, []);

  const orbColors = variant === "warm"
    ? ["rgba(6, 182, 212, 0.2)", "rgba(16, 185, 129, 0.15)", "rgba(251, 146, 60, 0.12)"]
    : variant === "cool"
    ? ["rgba(96, 165, 250, 0.2)", "rgba(34, 211, 238, 0.15)", "rgba(129, 140, 248, 0.12)"]
    : variant === "cosmic"
    ? ["rgba(13, 148, 136, 0.2)", "rgba(6, 182, 212, 0.15)", "rgba(16, 185, 129, 0.1)"]
    : ["rgba(13, 148, 136, 0.15)", "rgba(6, 182, 212, 0.1)", "rgba(16, 185, 129, 0.08)"];

  return (
    <>
      {/* Cosmic background gradients */}
      <div className="page-cosmic-bg" />

      {/* Animated nebula wash */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          className="absolute w-[800px] h-[800px] rounded-full"
          style={{
            top: "-20%",
            right: "-15%",
            background: `radial-gradient(circle, ${orbColors[0]}, transparent 60%)`,
            filter: "blur(80px)",
            opacity: "var(--orb-opacity, 0.12)",
          }}
          animate={{
            x: [0, 50, -30, 20, 0],
            y: [0, -30, 50, -20, 0],
          }}
          transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full"
          style={{
            bottom: "-15%",
            left: "-10%",
            background: `radial-gradient(circle, ${orbColors[1]}, transparent 60%)`,
            filter: "blur(70px)",
            opacity: "var(--orb-opacity, 0.1)",
          }}
          animate={{
            x: [0, -40, 25, -15, 0],
            y: [0, 30, -40, 20, 0],
          }}
          transition={{ duration: 40, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full"
          style={{
            top: "40%",
            left: "30%",
            background: `radial-gradient(circle, ${orbColors[2]}, transparent 60%)`,
            filter: "blur(60px)",
            opacity: "var(--orb-opacity, 0.06)",
          }}
          animate={{
            x: [0, 30, -20, 15, 0],
            y: [0, -20, 30, -15, 0],
          }}
          transition={{ duration: 45, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Floating energy orbs */}
        <motion.div
          className="absolute w-[150px] h-[150px] rounded-full"
          style={{
            top: "20%",
            left: "60%",
            background: "radial-gradient(circle, rgba(96, 165, 250, 0.1) 0%, transparent 60%)",
            filter: "blur(30px)",
            opacity: "var(--orb-opacity, 0.04)",
          }}
          animate={{
            x: [0, 80, -60, 40, 0],
            y: [0, -60, 80, -40, 0],
          }}
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[180px] h-[180px] rounded-full"
          style={{
            bottom: "25%",
            right: "20%",
            background: "radial-gradient(circle, rgba(34, 211, 238, 0.08) 0%, transparent 60%)",
            filter: "blur(35px)",
            opacity: "var(--orb-opacity, 0.03)",
          }}
          animate={{
            x: [0, -70, 50, -30, 0],
            y: [0, 50, -70, 35, 0],
          }}
          transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
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
            stroke="rgba(13, 148, 136, 0.25)"
            strokeWidth="0.5"
            strokeDasharray="4 6"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.1, 0.4, 0.1] }}
            transition={{ duration: 3 + i * 0.3, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
            style={{ opacity: "var(--constellation-opacity, 0.25)" }}
          />
        ))}
        {constellations.points.map((point, i) => (
          <motion.circle
            key={i}
            cx={`${point.x}%`}
            cy={`${point.y}%`}
            r="2"
            fill="rgba(13, 148, 136, 0.5)"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.2, 0.7, 0.2], r: [1.5, 2.5, 1.5] }}
            transition={{ duration: 2 + i * 0.3, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }}
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
              boxShadow: `0 0 ${p.size * 4}px ${p.color}`,
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
          background: "linear-gradient(90deg, transparent, rgba(13, 148, 136, 0.04), transparent)",
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
          background: "linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.03), transparent)",
          opacity: "var(--glow-opacity, 0.4)",
        }}
        animate={{
          x: ["150%", "-50%"],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear", delay: 5 }}
      />

      {/* Mouse-following glow */}
      <motion.div
        className="fixed pointer-events-none z-[2] w-[400px] h-[400px] rounded-full"
        style={{
          left: mousePos.x - 200,
          top: mousePos.y - 200,
          background: "radial-gradient(circle, rgba(13, 148, 136, 0.06), transparent 70%)",
          filter: "blur(40px)",
          transition: "left 0.3s ease-out, top 0.3s ease-out",
          opacity: "var(--glow-opacity, 0.06)",
        }}
      />

      {/* Corner flourishes */}
      <div className="corner-flourish corner-flourish--tl" />
      <div className="corner-flourish corner-flourish--tr" />
      <div className="corner-flourish corner-flourish--bl" />
      <div className="corner-flourish corner-flourish--br" />
    </>
  );
}
