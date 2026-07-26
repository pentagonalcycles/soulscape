"use client";

import { motion } from "framer-motion";
import { useAuth } from "./AuthProvider";

const intensityMap = {
  off: { main: 0, secondary: 0, accent: 0 },
  subtle: { main: 0.1, secondary: 0.08, accent: 0.05 },
  normal: { main: 0.3, secondary: 0.2, accent: 0.15 },
  vivid: { main: 0.5, secondary: 0.35, accent: 0.25 },
};

export default function Nebula() {
  const { userPreferences } = useAuth();
  const intensity = intensityMap[userPreferences.nebula_intensity] ?? intensityMap.normal;

  if (intensity.main === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Main nebula blob - top right */}
      <motion.div
        className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(107, 63, 160, 0.6) 0%, rgba(157, 124, 216, 0.3) 40%, transparent 70%)",
          filter: "blur(80px)",
          opacity: intensity.main,
        }}
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -20, 30, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Secondary nebula blob - bottom left */}
      <motion.div
        className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(232, 121, 168, 0.5) 0%, rgba(157, 124, 216, 0.3) 40%, transparent 70%)",
          filter: "blur(60px)",
          opacity: intensity.secondary,
        }}
        animate={{
          x: [0, -30, 20, 0],
          y: [0, 20, -30, 0],
          scale: [1, 0.95, 1.1, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Small accent blob - center */}
      <motion.div
        className="absolute top-1/3 left-1/3 w-[400px] h-[400px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(245, 208, 98, 0.4) 0%, rgba(232, 121, 168, 0.2) 40%, transparent 70%)",
          filter: "blur(50px)",
          opacity: intensity.accent,
        }}
        animate={{
          x: [0, 40, -30, 0],
          y: [0, -40, 20, 0],
          scale: [1, 1.15, 0.9, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
