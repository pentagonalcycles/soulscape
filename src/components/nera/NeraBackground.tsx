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
          background: "radial-gradient(circle, rgba(0, 255, 136, 0.08) 0%, rgba(0, 204, 106, 0.04) 40%, transparent 70%)",
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
          background: "radial-gradient(circle, rgba(0, 204, 106, 0.06) 0%, rgba(16, 185, 129, 0.03) 40%, transparent 70%)",
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
          background: "radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 60%)",
          filter: "blur(50px)",
        }}
        animate={{ x: [0, 20, -15, 0], y: [0, -20, 25, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Tech grid overlay */}
      <div className="tech-grid absolute inset-0" />

      {/* Top edge glow */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent 10%, rgba(0, 255, 136, 0.12) 50%, transparent 90%)",
        }}
      />

      {/* Bottom edge glow */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent 10%, rgba(0, 255, 136, 0.06) 50%, transparent 90%)",
        }}
      />
    </div>
  );
}
