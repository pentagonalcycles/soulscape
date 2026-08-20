"use client";

import { motion } from "framer-motion";
import { useIsMobile } from "@/lib/useIsMobile";

export default function Nebula() {
  const { isMobile } = useIsMobile();

  if (isMobile) {
    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <motion.div
          className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(0, 255, 136, 0.2) 0%, rgba(0, 204, 106, 0.1) 40%, transparent 70%)",
            filter: "blur(80px)",
            opacity: "var(--nebula-opacity, 0.12)",
          }}
          animate={{
            x: [0, 30, -20, 10, 0],
            y: [0, -20, 30, -15, 0],
            scale: [1, 1.1, 0.92, 1.05, 1],
          }}
          transition={{ duration: 50, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(57, 255, 20, 0.18) 0%, rgba(74, 222, 128, 0.08) 40%, transparent 70%)",
            filter: "blur(65px)",
            opacity: "var(--nebula-opacity, 0.1)",
          }}
          animate={{
            x: [0, -25, 18, -10, 0],
            y: [0, 22, -28, 15, 0],
            scale: [1, 0.92, 1.08, 0.96, 1],
          }}
          transition={{ duration: 55, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    );
  }
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Main nebula blob - top right — green */}
      <motion.div
        className="absolute -top-1/4 -right-1/4 w-[900px] h-[900px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(0, 255, 136, 0.25) 0%, rgba(0, 204, 106, 0.12) 35%, rgba(57, 255, 20, 0.06) 55%, transparent 70%)",
          filter: "blur(80px)",
          opacity: "var(--nebula-opacity, 0.15)",
        }}
        animate={{
          x: [0, 45, -35, 25, 0],
          y: [0, -35, 45, -25, 0],
          scale: [1, 1.18, 0.88, 1.08, 1],
        }}
        transition={{ duration: 40, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Secondary nebula blob - bottom left — emerald */}
      <motion.div
        className="absolute -bottom-1/4 -left-1/4 w-[700px] h-[700px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(0, 204, 106, 0.22) 0%, rgba(74, 222, 128, 0.1) 35%, rgba(52, 211, 153, 0.05) 55%, transparent 70%)",
          filter: "blur(65px)",
          opacity: "var(--nebula-opacity, 0.12)",
        }}
        animate={{
          x: [0, -40, 30, -20, 0],
          y: [0, 35, -40, 25, 0],
          scale: [1, 0.88, 1.14, 0.94, 1],
        }}
        transition={{ duration: 45, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Accent nebula blob - center — lime */}
      <motion.div
        className="absolute top-1/3 left-1/3 w-[500px] h-[500px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(57, 255, 20, 0.18) 0%, rgba(0, 255, 136, 0.08) 35%, rgba(74, 222, 128, 0.04) 55%, transparent 70%)",
          filter: "blur(55px)",
          opacity: "var(--nebula-opacity, 0.08)",
        }}
        animate={{
          x: [0, 30, -25, 18, 0],
          y: [0, -25, 30, -18, 0],
          scale: [1, 1.15, 0.85, 1.08, 1],
        }}
        transition={{ duration: 50, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Warm accent blob — top center — deep forest */}
      <motion.div
        className="absolute -top-[10%] left-[30%] w-[500px] h-[500px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(26, 92, 46, 0.3) 0%, rgba(0, 204, 106, 0.12) 40%, transparent 65%)",
          filter: "blur(70px)",
          opacity: "var(--nebula-opacity, 0.06)",
        }}
        animate={{
          x: [0, 35, -20, 15, 0],
          y: [0, -15, 25, -10, 0],
          scale: [1, 1.2, 0.9, 1.1, 1],
        }}
        transition={{ duration: 55, repeat: Infinity, ease: "easeInOut", delay: 10 }}
      />

      {/* Deep green blob — bottom right */}
      <motion.div
        className="absolute -bottom-[15%] right-[5%] w-[550px] h-[550px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(0, 100, 60, 0.25) 0%, rgba(0, 255, 136, 0.08) 35%, transparent 65%)",
          filter: "blur(75px)",
          opacity: "var(--nebula-opacity, 0.08)",
        }}
        animate={{
          x: [0, -30, 25, -15, 0],
          y: [0, 20, -30, 15, 0],
          scale: [0.95, 1.1, 0.9, 1.05, 0.95],
        }}
        transition={{ duration: 48, repeat: Infinity, ease: "easeInOut", delay: 5 }}
      />

      {/* Floating light orb - top left */}
      <motion.div
        className="absolute top-[10%] left-[15%] w-[220px] h-[220px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(0, 255, 136, 0.12) 0%, rgba(57, 255, 20, 0.04) 50%, transparent 60%)",
          filter: "blur(40px)",
          opacity: "var(--orb-opacity, 0.06)",
        }}
        animate={{
          x: [0, 70, -50, 35, 0],
          y: [0, -50, 60, -35, 0],
        }}
        transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating light orb - bottom right */}
      <motion.div
        className="absolute bottom-[15%] right-[10%] w-[280px] h-[280px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(74, 222, 128, 0.1) 0%, rgba(0, 204, 106, 0.04) 50%, transparent 60%)",
          filter: "blur(45px)",
          opacity: "var(--orb-opacity, 0.05)",
        }}
        animate={{
          x: [0, -60, 40, -30, 0],
          y: [0, 40, -50, 30, 0],
        }}
        transition={{ duration: 38, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Warm floating orb - center right */}
      <motion.div
        className="absolute top-[45%] right-[20%] w-[180px] h-[180px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(0, 180, 100, 0.1) 0%, rgba(57, 255, 20, 0.04) 50%, transparent 60%)",
          filter: "blur(35px)",
          opacity: "var(--orb-opacity, 0.04)",
        }}
        animate={{
          x: [0, -45, 30, -20, 0],
          y: [0, 30, -45, 25, 0],
        }}
        transition={{ duration: 32, repeat: Infinity, ease: "easeInOut", delay: 7 }}
      />

      {/* Energy wave - center horizontal */}
      <motion.div
        className="absolute top-1/2 left-0 right-0 h-[2px]"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(0, 255, 136, 0.08), rgba(57, 255, 20, 0.05), rgba(0, 204, 106, 0.04), transparent)",
          opacity: "var(--glow-opacity, 0.5)",
        }}
        animate={{
          scaleX: [0.4, 1.3, 0.4],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Energy wave - diagonal */}
      <motion.div
        className="absolute top-0 left-0 w-full h-full"
        style={{
          background: "linear-gradient(135deg, transparent 38%, rgba(0, 255, 136, 0.03) 50%, transparent 62%)",
          opacity: "var(--glow-opacity, 0.6)",
        }}
        animate={{
          rotate: [0, 3, -1, 2, 0],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Vertical energy wave */}
      <motion.div
        className="absolute top-0 left-0 w-full h-full"
        style={{
          background: "linear-gradient(180deg, transparent 35%, rgba(0, 204, 106, 0.02) 50%, transparent 65%)",
          opacity: "var(--glow-opacity, 0.4)",
        }}
        animate={{
          rotate: [0, -2, 1, -1, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 6 }}
      />

      {/* Pulsing center glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(0, 255, 136, 0.06) 0%, rgba(57, 255, 20, 0.03) 40%, transparent 60%)",
          filter: "blur(35px)",
          opacity: "var(--glow-opacity, 0.04)",
        }}
        animate={{
          scale: [0.75, 1.35, 0.75],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Secondary pulsing glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(0, 204, 106, 0.03) 0%, transparent 55%)",
          filter: "blur(50px)",
          opacity: "var(--glow-opacity, 0.03)",
        }}
        animate={{
          scale: [1.2, 0.7, 1.2],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />
    </div>
  );
}
