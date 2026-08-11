"use client";

import { motion } from "framer-motion";
import { EmotionStat, getEmotionById } from "./emotions";

interface EmotionBreakdownProps {
  stats: EmotionStat[];
}

export default function EmotionBreakdown({ stats }: EmotionBreakdownProps) {
  if (stats.length === 0) return null;

  return (
    <div className="space-y-2">
      {stats.map((stat, i) => {
        const emotion = getEmotionById(stat.emotion);
        return (
          <motion.div
            key={stat.emotion}
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
          >
            <span className="text-lg w-8 text-center flex-shrink-0">{emotion.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  {emotion.label}
                </span>
                <span className="text-xs font-medium" style={{ color: emotion.color }}>
                  {stat.percentage}%
                </span>
              </div>
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{ background: "rgba(13, 148, 136, 0.06)" }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: emotion.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${stat.percentage}%` }}
                  transition={{ delay: i * 0.05 + 0.2, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
