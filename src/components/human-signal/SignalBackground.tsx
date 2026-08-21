"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface SignalBackgroundProps {
  mood?: "default" | "sending" | "waiting" | "heard" | "receiving";
}

export default function SignalBackground({ mood = "default" }: SignalBackgroundProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const gradients: Record<string, { main: string; orb1: string; orb2: string; orb3: string; orb4: string }> = {
    default: {
      main: "linear-gradient(160deg, #0f1a20 0%, #142028 40%, #0f1a20 100%)",
      orb1: "rgba(0, 255, 136, 0.2)",
      orb2: "rgba(99, 102, 241, 0.15)",
      orb3: "rgba(236, 72, 153, 0.12)",
      orb4: "rgba(251, 191, 36, 0.1)",
    },
    sending: {
      main: "linear-gradient(160deg, #0f1a20 0%, #122028 40%, #0f1a20 100%)",
      orb1: "rgba(0, 255, 136, 0.25)",
      orb2: "rgba(99, 102, 241, 0.18)",
      orb3: "rgba(0, 204, 106, 0.15)",
      orb4: "rgba(251, 191, 36, 0.12)",
    },
    waiting: {
      main: "linear-gradient(160deg, #0c1418 0%, #101820 40%, #0c1418 100%)",
      orb1: "rgba(0, 255, 136, 0.12)",
      orb2: "rgba(99, 102, 241, 0.1)",
      orb3: "rgba(236, 72, 153, 0.08)",
      orb4: "rgba(251, 191, 36, 0.06)",
    },
    heard: {
      main: "linear-gradient(160deg, #14101a 0%, #1a1420 40%, #14101a 100%)",
      orb1: "rgba(236, 72, 153, 0.2)",
      orb2: "rgba(99, 102, 241, 0.15)",
      orb3: "rgba(0, 255, 136, 0.12)",
      orb4: "rgba(251, 191, 36, 0.1)",
    },
    receiving: {
      main: "linear-gradient(160deg, #0f1a20 0%, #141820 40%, #0f1a20 100%)",
      orb1: "rgba(99, 102, 241, 0.18)",
      orb2: "rgba(0, 255, 136, 0.15)",
      orb3: "rgba(236, 72, 153, 0.12)",
      orb4: "rgba(251, 191, 36, 0.1)",
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

      {/* Primary orb - green */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: "70vw",
          height: "70vw",
          maxWidth: "700px",
          maxHeight: "700px",
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

      {/* Secondary orb - indigo */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: "60vw",
          height: "60vw",
          maxWidth: "600px",
          maxHeight: "600px",
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

      {/* Third orb - pink */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: "40vw",
          height: "40vw",
          maxWidth: "400px",
          maxHeight: "400px",
          top: "50%",
          left: "50%",
          filter: "blur(60px)",
        }}
        animate={{
          background: `radial-gradient(circle, ${g.orb3}, transparent 70%)`,
          x: [0, 25, -20, 0],
          y: [0, -20, 25, 0],
        }}
        transition={{
          background: { duration: 2 },
          x: { duration: 18, repeat: Infinity, ease: "easeInOut" },
          y: { duration: 15, repeat: Infinity, ease: "easeInOut" },
        }}
      />

      {/* Fourth orb - gold */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: "35vw",
          height: "35vw",
          maxWidth: "350px",
          maxHeight: "350px",
          top: "20%",
          left: "30%",
          filter: "blur(50px)",
        }}
        animate={{
          background: `radial-gradient(circle, ${g.orb4}, transparent 70%)`,
          x: [0, -20, 15, 0],
          y: [0, 15, -20, 0],
        }}
        transition={{
          background: { duration: 2 },
          x: { duration: 20, repeat: Infinity, ease: "easeInOut" },
          y: { duration: 16, repeat: Infinity, ease: "easeInOut" },
        }}
      />
    </div>
  );
}
