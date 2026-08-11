"use client";

import { motion } from "framer-motion";

export default function Nebula() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Main nebula blob - top right — teal */}
      <motion.div
        className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(13, 148, 136, 0.3) 0%, rgba(6, 182, 212, 0.15) 40%, transparent 70%)",
          filter: "blur(80px)",
          opacity: "var(--nebula-opacity, 0.15)",
        }}
        animate={{
          x: [0, 40, -30, 20, 0],
          y: [0, -30, 40, -20, 0],
          scale: [1, 1.15, 0.9, 1.05, 1],
        }}
        transition={{ duration: 40, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Secondary nebula blob - bottom left — cyan */}
      <motion.div
        className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(6, 182, 212, 0.25) 0%, rgba(16, 185, 129, 0.12) 40%, transparent 70%)",
          filter: "blur(60px)",
          opacity: "var(--nebula-opacity, 0.12)",
        }}
        animate={{
          x: [0, -35, 25, -15, 0],
          y: [0, 30, -35, 20, 0],
          scale: [1, 0.9, 1.1, 0.95, 1],
        }}
        transition={{ duration: 45, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Accent nebula blob - center — emerald */}
      <motion.div
        className="absolute top-1/3 left-1/3 w-[400px] h-[400px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, rgba(13, 148, 136, 0.1) 40%, transparent 70%)",
          filter: "blur(50px)",
          opacity: "var(--nebula-opacity, 0.08)",
        }}
        animate={{
          x: [0, 25, -20, 15, 0],
          y: [0, -20, 25, -15, 0],
          scale: [1, 1.12, 0.88, 1.06, 1],
        }}
        transition={{ duration: 50, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating light orb - top left */}
      <motion.div
        className="absolute top-[10%] left-[15%] w-[200px] h-[200px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(96, 165, 250, 0.15) 0%, transparent 60%)",
          filter: "blur(40px)",
          opacity: "var(--orb-opacity, 0.06)",
        }}
        animate={{
          x: [0, 60, -40, 30, 0],
          y: [0, -40, 50, -30, 0],
        }}
        transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating light orb - bottom right */}
      <motion.div
        className="absolute bottom-[15%] right-[10%] w-[250px] h-[250px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 60%)",
          filter: "blur(45px)",
          opacity: "var(--orb-opacity, 0.05)",
        }}
        animate={{
          x: [0, -50, 35, -25, 0],
          y: [0, 35, -45, 25, 0],
        }}
        transition={{ duration: 38, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Energy wave - center horizontal */}
      <motion.div
        className="absolute top-1/2 left-0 right-0 h-[1px]"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(13, 148, 136, 0.08), rgba(6, 182, 212, 0.06), transparent)",
          opacity: "var(--glow-opacity, 0.5)",
        }}
        animate={{
          scaleX: [0.5, 1.2, 0.5],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Energy wave - diagonal */}
      <motion.div
        className="absolute top-0 left-0 w-full h-full"
        style={{
          background: "linear-gradient(135deg, transparent 40%, rgba(13, 148, 136, 0.03) 50%, transparent 60%)",
          opacity: "var(--glow-opacity, 0.6)",
        }}
        animate={{
          rotate: [0, 2, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Pulsing center glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(13, 148, 136, 0.06) 0%, transparent 60%)",
          filter: "blur(30px)",
          opacity: "var(--glow-opacity, 0.04)",
        }}
        animate={{
          scale: [0.8, 1.3, 0.8],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
