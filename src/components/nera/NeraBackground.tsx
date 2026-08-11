"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function NeraBackground() {
  const [mounted, setMounted] = useState(false);
  const [bgColor, setBgColor] = useState("#ffffff");

  useEffect(() => {
    const stored = localStorage.getItem("bg-color");
    if (stored) setBgColor(stored);
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Base — uses the user's custom background */}
      <div className="absolute inset-0" style={{ background: bgColor }} />

      {/* Ambient orb — top right */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: "70vw",
          height: "70vw",
          maxWidth: "800px",
          maxHeight: "800px",
          top: "-25%",
          right: "-20%",
          background: "radial-gradient(circle, rgba(13, 148, 136, 0.05) 0%, rgba(6, 182, 212, 0.02) 40%, transparent 70%)",
          filter: "blur(60px)",
        }}
        animate={{ x: [0, 30, -20, 0], y: [0, -25, 35, 0] }}
        transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Secondary orb — bottom left */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: "55vw",
          height: "55vw",
          maxWidth: "600px",
          maxHeight: "600px",
          bottom: "-20%",
          left: "-15%",
          background: "radial-gradient(circle, rgba(6, 182, 212, 0.04) 0%, rgba(16, 185, 129, 0.02) 40%, transparent 70%)",
          filter: "blur(50px)",
        }}
        animate={{ x: [0, -25, 20, 0], y: [0, 30, -20, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Accent orb — center */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: "40vw",
          height: "40vw",
          maxWidth: "450px",
          maxHeight: "450px",
          top: "35%",
          left: "15%",
          background: "radial-gradient(circle, rgba(16, 185, 129, 0.03) 0%, transparent 60%)",
          filter: "blur(50px)",
        }}
        animate={{ x: [0, 20, -15, 0], y: [0, -20, 25, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Subtle grain */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E\")",
          opacity: 0.25,
        }}
      />

      {/* Top edge glow */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent 10%, rgba(13, 148, 136, 0.08) 50%, transparent 90%)",
        }}
      />
    </div>
  );
}
