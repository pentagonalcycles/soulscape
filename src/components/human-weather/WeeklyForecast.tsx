"use client";

import { motion } from "framer-motion";
import { EmotionStat, getEmotionById } from "./emotions";

interface WeeklyForecastProps {
  weeklyData: { day: string; stats: EmotionStat[] }[];
}

export default function WeeklyForecast({ weeklyData }: WeeklyForecastProps) {
  if (weeklyData.length === 0) return null;

  return (
    <div>
      <h3
        className="text-xs uppercase tracking-widest mb-4"
        style={{ color: "var(--text-dim)" }}
      >
        7-Day Human Weather
      </h3>
      <div className="space-y-2">
        {weeklyData.map((day, i) => {
          const dominant = day.stats[0];
          const emotion = dominant ? getEmotionById(dominant.emotion) : null;

          return (
            <motion.div
              key={day.day}
              className="flex items-center gap-3 py-2 px-3 rounded-xl"
              style={{ background: "rgba(13, 148, 136, 0.02)" }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <span className="text-xs w-10" style={{ color: "var(--text-muted)" }}>
                {day.day}
              </span>
              <span className="text-lg">{emotion?.emoji || "—"}</span>
              <span className="text-xs flex-1" style={{ color: "var(--text-secondary)" }}>
                {emotion?.label || "No data"}
              </span>
              {dominant && (
                <span className="text-xs font-medium" style={{ color: emotion?.color }}>
                  {dominant.percentage}%
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
