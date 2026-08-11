"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface UnseenBackgroundProps {
  mood?: "default" | "discovery" | "reveal" | "connection";
}

export default function UnseenBackground({ mood = "default" }: UnseenBackgroundProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const gradients: Record<string, { main: string; orb1: string; orb2: string }> = {
    default: {
      main: "linear-gradient(160deg, #0c0a14 0%, #12101e 40%, #0a0812 100%)",
      orb1: "rgba(139, 92, 246, 0.06)",
      orb2: "rgba(236, 72, 153, 0.04)",
    },
    discovery: {
      main: "linear-gradient(160deg, #0a0812 0%, #100c1a 40%, #0c0a14 100%)",
      orb1: "rgba(139, 92, 246, 0.08)",
      orb2: "rgba(99, 102, 241, 0.05)",
    },
    reveal: {
      main: "linear-gradient(160deg, #0e0a16 0%, #14101e 40%, #0c0a14 100%)",
      orb1: "rgba(236, 72, 153, 0.1)",
      orb2: "rgba(139, 92, 246, 0.06)",
    },
    connection: {
      main: "linear-gradient(160deg, #0a0c14 0%, #10141e 40%, #0c0e18 100%)",
      orb1: "rgba(13, 148, 136, 0.08)",
      orb2: "rgba(236, 72, 153, 0.05)",
    },
  };

  const g = gradients[mood] || gradients.default;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      <motion.div
        className="absolute inset-0"
        animate={{ background: g.main }}
        transition={{ duration: 2 }}
      />

      <motion.div
        className="absolute rounded-full"
        style={{
          width: "60vw",
          height: "60vw",
          maxWidth: "600px",
          maxHeight: "600px",
          top: "-15%",
          right: "-15%",
          filter: "blur(100px)",
        }}
        animate={{
          background: `radial-gradient(circle, ${g.orb1}, transparent 70%)`,
          x: [0, 40, -30, 0],
          y: [0, -30, 40, 0],
        }}
        transition={{
          background: { duration: 2 },
          x: { duration: 25, repeat: Infinity, ease: "easeInOut" },
          y: { duration: 20, repeat: Infinity, ease: "easeInOut" },
        }}
      />

      <motion.div
        className="absolute rounded-full"
        style={{
          width: "50vw",
          height: "50vw",
          maxWidth: "500px",
          maxHeight: "500px",
          bottom: "-10%",
          left: "-10%",
          filter: "blur(80px)",
        }}
        animate={{
          background: `radial-gradient(circle, ${g.orb2}, transparent 70%)`,
          x: [0, -35, 25, 0],
          y: [0, 30, -20, 0],
        }}
        transition={{
          background: { duration: 2 },
          x: { duration: 22, repeat: Infinity, ease: "easeInOut" },
          y: { duration: 18, repeat: Infinity, ease: "easeInOut" },
        }}
      />

      {/* Grain overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
          opacity: 0.4,
        }}
      />
    </div>
  );
}
