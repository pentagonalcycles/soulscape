"use client";

import { motion } from "framer-motion";

interface DeathScreenProps {
  score: number;
  kills: number;
  timeSurvived: number;
  onPlayAgain: () => void;
  onReturnToSite: () => void;
  isMobile?: boolean;
}

function getRating(kills: number, score: number): { label: string; color: string; glow: string } {
  if (kills >= 20 || score >= 5000) return { label: "Legendary", color: "#10b981", glow: "rgba(16, 185, 129, 0.4)" };
  if (kills >= 15 || score >= 3000) return { label: "Mythic", color: "#00ff88", glow: "rgba(0, 255, 136, 0.4)" };
  if (kills >= 10 || score >= 2000) return { label: "Champion", color: "#00cc6a", glow: "rgba(0, 204, 106, 0.4)" };
  if (kills >= 7 || score >= 1200) return { label: "Expert", color: "#22d3ee", glow: "rgba(34, 211, 238, 0.4)" };
  if (kills >= 5 || score >= 800) return { label: "Skilled", color: "#14b8a6", glow: "rgba(20, 184, 166, 0.4)" };
  if (kills >= 3 || score >= 400) return { label: "Promising", color: "#5eead4", glow: "rgba(94, 234, 212, 0.4)" };
  if (kills >= 1 || score >= 100) return { label: "Beginner", color: "#94a3b8", glow: "rgba(148, 163, 184, 0.3)" };
  return { label: "Newcomer", color: "#64748b", glow: "rgba(100, 116, 139, 0.3)" };
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function DeathScreen({ score, kills, timeSurvived, onPlayAgain, onReturnToSite, isMobile = false }: DeathScreenProps) {
  const rating = getRating(kills, score);
  const scorePerKill = kills > 0 ? Math.round(score / kills) : 0;

  // Dark game aesthetic
  const panelBg = "rgba(15, 15, 35, 0.95)";
  const panelBorder = "rgba(0, 255, 136, 0.2)";
  const textPrimary = "#e2e8f0";
  const textSecondary = "#94a3b8";
  const statBg = "rgba(0, 255, 136, 0.08)";
  const statBorder = "rgba(0, 255, 136, 0.12)";

  const stats = [
    { label: "Final Score", value: Math.round(score).toLocaleString(), color: "#00ff88" },
    { label: "Eliminations", value: kills.toString(), color: "#10b981" },
    { label: "Time Survived", value: formatTime(timeSurvived), color: "#00cc6a" },
    { label: "Score/Kill", value: scorePerKill.toLocaleString(), color: "#14b8a6" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 flex items-center justify-center"
      style={{ background: "rgba(5, 5, 16, 0.9)", backdropFilter: "blur(8px)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className={isMobile ? "w-full max-w-xs mx-4 p-5 rounded-2xl text-center" : "w-full max-w-sm mx-4 p-6 rounded-2xl text-center"}
        style={{
          background: panelBg,
          border: `1px solid ${panelBorder}`,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.3)",
        }}
      >
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className={isMobile ? "text-xl mb-1" : "text-2xl mb-1"} style={{ color: textPrimary, fontWeight: 300 }}>Game Over</h2>
        </motion.div>

        {/* Rating */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
          className="my-3"
        >
          <div
            className={isMobile ? "inline-block px-3 py-1.5 rounded-xl text-base" : "inline-block px-4 py-2 rounded-xl text-lg"}
            style={{
              background: `${rating.color}15`,
              border: `1px solid ${rating.color}30`,
              color: rating.color,
              boxShadow: `0 0 20px ${rating.glow}`,
              fontWeight: 500,
            }}
          >
            {rating.label}
          </div>
        </motion.div>

        {/* Stats */}
        <div className="space-y-1.5 mb-5">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="flex items-center justify-between px-3 py-2 rounded-lg"
              style={{
                background: statBg,
                border: `1px solid ${statBorder}`,
              }}
            >
              <span className="text-xs" style={{ color: textSecondary }}>{stat.label}</span>
              <span className="text-sm font-medium" style={{ color: stat.color }}>{stat.value}</span>
            </motion.div>
          ))}
        </div>

        {/* Buttons */}
        <div className="space-y-2">
          <motion.button
            onClick={onPlayAgain}
            className={isMobile ? "w-full py-4 rounded-xl text-base cursor-pointer" : "w-full py-3 rounded-xl text-sm cursor-pointer"}
            style={{
              background: "linear-gradient(135deg, #00ff88, #00cc6a)",
              color: "#fff",
              border: "1px solid rgba(0, 255, 136, 0.3)",
              boxShadow: "0 4px 20px rgba(0, 255, 136, 0.25)",
              fontWeight: 500,
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Play Again
          </motion.button>

          <motion.button
            onClick={onReturnToSite}
            className={isMobile ? "w-full py-3.5 rounded-xl text-sm cursor-pointer" : "w-full py-2.5 rounded-xl text-xs cursor-pointer"}
            style={{
              background: statBg,
              color: textSecondary,
              border: `1px solid ${statBorder}`,
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Return to Site
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
