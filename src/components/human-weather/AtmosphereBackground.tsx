"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { EmotionStat, getEmotionById, getDominantEmotion } from "./emotions";

interface AtmosphereBackgroundProps {
  stats: EmotionStat[];
}

export default function AtmosphereBackground({ stats }: AtmosphereBackgroundProps) {
  const [mounted, setMounted] = useState(false);
  const dominant = getDominantEmotion(stats);
  const emotion = dominant ? getEmotionById(dominant.emotion) : null;

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const baseColor = emotion?.color || "#0d9488";

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Main atmosphere */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: getGradient(baseColor, emotion?.id),
        }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />

      {/* Floating orbs */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: "60vw",
          height: "60vw",
          maxWidth: "600px",
          maxHeight: "600px",
          top: "-10%",
          right: "-10%",
          filter: "blur(80px)",
          opacity: 0.15,
        }}
        animate={{
          background: `radial-gradient(circle, ${baseColor}40, transparent 70%)`,
          x: [0, 30, -20, 0],
          y: [0, -20, 30, 0],
        }}
        transition={{
          background: { duration: 2 },
          x: { duration: 20, repeat: Infinity, ease: "easeInOut" },
          y: { duration: 15, repeat: Infinity, ease: "easeInOut" },
        }}
      />

      <motion.div
        className="absolute rounded-full"
        style={{
          width: "50vw",
          height: "50vw",
          maxWidth: "500px",
          maxHeight: "500px",
          bottom: "-5%",
          left: "-10%",
          filter: "blur(60px)",
          opacity: 0.1,
        }}
        animate={{
          background: `radial-gradient(circle, ${baseColor}30, transparent 70%)`,
          x: [0, -25, 15, 0],
          y: [0, 25, -15, 0],
        }}
        transition={{
          background: { duration: 2 },
          x: { duration: 18, repeat: Infinity, ease: "easeInOut" },
          y: { duration: 22, repeat: Infinity, ease: "easeInOut" },
        }}
      />
    </div>
  );
}

function getGradient(color: string, emotionId?: string): string {
  const gradients: Record<string, string> = {
    happy: `linear-gradient(135deg, #fffbf0, #fef3c7, #fff7ed)`,
    calm: `linear-gradient(135deg, #f0fdfa, #e0f2fe, #f0f9ff)`,
    hopeful: `linear-gradient(135deg, #f0fdf4, #ecfdf5, #f0fdfa)`,
    loved: `linear-gradient(135deg, #fdf2f8, #fce7f3, #fff1f2)`,
    excited: `linear-gradient(135deg, #fffbeb, #fef3c7, #ffedd5)`,
    energised: `linear-gradient(135deg, #fefce8, #fef9c3, #fffbeb)`,
    tired: `linear-gradient(135deg, #eef2ff, #e0e7ff, #ede9fe)`,
    sad: `linear-gradient(135deg, #eff6ff, #dbeafe, #e0f2fe)`,
    lonely: `linear-gradient(135deg, #f8fafc, #f1f5f9, #e2e8f0)`,
    anxious: `linear-gradient(135deg, #faf5ff, #f3e8ff, #ede9fe)`,
    overwhelmed: `linear-gradient(135deg, #f0f9ff, #e0f2fe, #dbeafe)`,
    angry: `linear-gradient(135deg, #fef2f2, #fee2e2, #fff1f2)`,
    lost: `linear-gradient(135deg, #f8fafc, #f1f5f9, #e2e8f0)`,
    numb: `linear-gradient(135deg, #f5f5f4, #e7e5e4, #d6d3d1)`,
    unnamed: `linear-gradient(135deg, #faf5ff, #f3e8ff, #ede9fe)`,
  };

  return gradients[emotionId || ""] || `linear-gradient(135deg, #f0fdf9, #e6f7f2, #ccfbf1)`;
}
