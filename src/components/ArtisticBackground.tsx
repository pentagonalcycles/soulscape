"use client";

import { useMemo } from "react";

interface ArtisticBackgroundProps {
  variant?: "default" | "warm" | "cool" | "cosmic";
}

export default function ArtisticBackground({ variant = "default" }: ArtisticBackgroundProps) {
  const particles = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: `${(i * 17 + 7) % 100}%`,
      size: 1 + (i % 6) * 0.6,
      duration: 8 + (i * 3) % 18,
      delay: (i * 0.5) % 7,
      color: [
        "rgba(0, 255, 136, 0.8)",
        "rgba(57, 255, 20, 0.7)",
        "rgba(0, 204, 106, 0.6)",
        "rgba(74, 222, 128, 0.7)",
        "rgba(52, 211, 153, 0.6)",
        "rgba(0, 180, 100, 0.5)",
        "rgba(26, 92, 46, 0.4)",
      ][i % 7],
    }));
  }, []);

  const orbColors = variant === "warm"
    ? ["rgba(0, 255, 136, 0.2)", "rgba(0, 204, 106, 0.14)", "rgba(57, 255, 20, 0.1)", "rgba(26, 92, 46, 0.08)"]
    : variant === "cool"
    ? ["rgba(0, 180, 100, 0.2)", "rgba(74, 222, 128, 0.14)", "rgba(0, 255, 136, 0.1)", "rgba(52, 211, 153, 0.08)"]
    : variant === "cosmic"
    ? ["rgba(0, 255, 136, 0.22)", "rgba(57, 255, 20, 0.14)", "rgba(0, 204, 106, 0.1)", "rgba(74, 222, 128, 0.08)"]
    : ["rgba(0, 255, 136, 0.15)", "rgba(57, 255, 20, 0.1)", "rgba(0, 204, 106, 0.08)", "rgba(74, 222, 128, 0.06)"];

  return (
    <>
      {/* Cosmic background gradients */}
      <div className="page-cosmic-bg" />

      {/* Static nebula orbs - no continuous animation */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute w-[900px] h-[900px] rounded-full"
          style={{
            top: "-22%",
            right: "-18%",
            background: `radial-gradient(circle, ${orbColors[0]}, ${orbColors[1]} 40%, transparent 60%)`,
            filter: "blur(60px)",
            opacity: "var(--orb-opacity, 0.12)",
          }}
        />
        <div
          className="absolute w-[700px] h-[700px] rounded-full"
          style={{
            bottom: "-18%",
            left: "-12%",
            background: `radial-gradient(circle, ${orbColors[1]}, ${orbColors[2]} 40%, transparent 60%)`,
            filter: "blur(50px)",
            opacity: "var(--orb-opacity, 0.1)",
          }}
        />
        <div
          className="absolute w-[550px] h-[550px] rounded-full"
          style={{
            top: "40%",
            left: "28%",
            background: `radial-gradient(circle, ${orbColors[2]}, ${orbColors[3]} 40%, transparent 60%)`,
            filter: "blur(45px)",
            opacity: "var(--orb-opacity, 0.06)",
          }}
        />
      </div>

      {/* Floating particles - reduced to 15 */}
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

      {/* Corner flourishes */}
      <div className="corner-flourish corner-flourish--tl" />
      <div className="corner-flourish corner-flourish--tr" />
      <div className="corner-flourish corner-flourish--bl" />
      <div className="corner-flourish corner-flourish--br" />
    </>
  );
}
