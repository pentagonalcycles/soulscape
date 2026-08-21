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

  const gradients: Record<string, { main: string; orb1: string; orb2: string; orb3: string }> = {
    default: {
      main: "linear-gradient(160deg, #0f1a20 0%, #142028 40%, #0f1a20 100%)",
      orb1: "rgba(0, 255, 136, 0.12)",
      orb2: "rgba(99, 102, 241, 0.1)",
      orb3: "rgba(236, 72, 153, 0.08)",
    },
    sending: {
      main: "linear-gradient(160deg, #0f1a20 0%, #122028 40%, #0f1a20 100%)",
      orb1: "rgba(0, 255, 136, 0.18)",
      orb2: "rgba(99, 102, 241, 0.12)",
      orb3: "rgba(0, 204, 106, 0.1)",
    },
    waiting: {
      main: "linear-gradient(160deg, #0c1418 0%, #101820 40%, #0c1418 100%)",
      orb1: "rgba(0, 255, 136, 0.08)",
      orb2: "rgba(99, 102, 241, 0.06)",
      orb3: "rgba(236, 72, 153, 0.05)",
    },
    heard: {
      main: "linear-gradient(160deg, #14101a 0%, #1a1420 40%, #14101a 100%)",
      orb1: "rgba(236, 72, 153, 0.12)",
      orb2: "rgba(99, 102, 241, 0.1)",
      orb3: "rgba(0, 255, 136, 0.08)",
    },
    receiving: {
      main: "linear-gradient(160deg, #0f1a20 0%, #141820 40%, #0f1a20 100%)",
      orb1: "rgba(99, 102, 241, 0.12)",
      orb2: "rgba(0, 255, 136, 0.1)",
      orb3: "rgba(236, 72, 153, 0.08)",
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

      {/* Static ambient orbs - no continuous movement */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: "60vw",
          height: "60vw",
          maxWidth: "600px",
          maxHeight: "600px",
          top: "-15%",
          right: "-15%",
          filter: "blur(40px)",
        }}
        animate={{
          background: `radial-gradient(circle, ${g.orb1}, transparent 70%)`,
        }}
        transition={{ duration: 2 }}
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
          filter: "blur(35px)",
        }}
        animate={{
          background: `radial-gradient(circle, ${g.orb2}, transparent 70%)`,
        }}
        transition={{ duration: 2 }}
      />

      <motion.div
        className="absolute rounded-full"
        style={{
          width: "35vw",
          height: "35vw",
          maxWidth: "350px",
          maxHeight: "350px",
          top: "45%",
          left: "55%",
          filter: "blur(30px)",
        }}
        animate={{
          background: `radial-gradient(circle, ${g.orb3}, transparent 70%)`,
        }}
        transition={{ duration: 2 }}
      />
    </div>
  );
}
